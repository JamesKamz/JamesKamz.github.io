import "server-only";

export type YoutubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

export type YoutubeChannel = {
  title: string;
  subscribers: number | null;
  videos: YoutubeVideo[];
};

const API = "https://www.googleapis.com/youtube/v3";
const REVALIDATE = 3600; // 1h

type ChannelsResponse = {
  items?: {
    snippet: { title: string };
    statistics: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
    contentDetails: { relatedPlaylists: { uploads: string } };
  }[];
};

type PlaylistResponse = {
  items?: {
    snippet: {
      title: string;
      publishedAt: string;
      resourceId: { videoId: string };
      thumbnails: Record<string, { url: string } | undefined>;
    };
  }[];
};

/**
 * Latest uploads + subscriber count via the YouTube Data API v3.
 * Returns `null` when YOUTUBE_API_KEY is missing or the API fails (UI falls back gracefully).
 */
export async function getYoutubeChannel(handle: string, max = 6): Promise<YoutubeChannel | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || !handle) return null;
  try {
    const channelRes = await fetch(
      `${API}/channels?part=snippet,statistics,contentDetails&forHandle=${encodeURIComponent(handle)}&key=${key}`,
      { next: { revalidate: REVALIDATE, tags: ["youtube"] } },
    );
    if (!channelRes.ok) throw new Error(`channels ${channelRes.status}`);
    const channel = ((await channelRes.json()) as ChannelsResponse).items?.[0];
    if (!channel) return null;

    const uploads = channel.contentDetails.relatedPlaylists.uploads;
    const listRes = await fetch(
      `${API}/playlistItems?part=snippet&maxResults=${max}&playlistId=${uploads}&key=${key}`,
      { next: { revalidate: REVALIDATE, tags: ["youtube"] } },
    );
    if (!listRes.ok) throw new Error(`playlistItems ${listRes.status}`);
    const list = (await listRes.json()) as PlaylistResponse;

    const videos: YoutubeVideo[] = (list.items ?? [])
      .filter((item) => item.snippet.title !== "Private video")
      .map((item) => {
        const thumbs = item.snippet.thumbnails;
        return {
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnail: (thumbs.maxres ?? thumbs.high ?? thumbs.medium ?? thumbs.default)?.url ?? "",
        };
      });

    const stats = channel.statistics;
    return {
      title: channel.snippet.title,
      subscribers: stats.hiddenSubscriberCount || !stats.subscriberCount ? null : Number(stats.subscriberCount),
      videos,
    };
  } catch (error) {
    console.error("[youtube] fetch failed:", (error as Error).message);
    return null;
  }
}
