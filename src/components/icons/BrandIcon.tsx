import { brandPaths, type Brand } from "./brand-paths";

export function BrandIcon({ brand, className = "size-4" }: { brand: Brand; className?: string }) {
  if (brand === "comeup") {
    // Official "co_" mark from comeup.com/safari-pinned-tab.svg (40×40), cropped to the glyph.
    return (
      <svg viewBox="8 8 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.355 17.167v.014c.008 1.466 1.147 2.652 2.55 2.652 1.41 0 2.552-1.194 2.552-2.666 0-1.473-1.142-2.667-2.551-2.667-1.409 0-2.55 1.194-2.55 2.667Zm2.55 5.5c-1.549 0-2.942-.7-3.905-1.816-.963 1.115-2.356 1.816-3.906 1.816-2.905 0-5.26-2.463-5.26-5.5 0-3.038 2.355-5.5 5.26-5.5V14.5c-1.408 0-2.55 1.194-2.55 2.667 0 1.472 1.142 2.666 2.55 2.666 1.404 0 2.544-1.186 2.551-2.652v-.014c0-3.038 2.355-5.5 5.26-5.5 2.906 0 5.262 2.462 5.262 5.5 0 3.037-2.356 5.5-5.261 5.5ZM10.834 25.5h18.334v2.833H10.833V25.5Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d={brandPaths[brand]} />
    </svg>
  );
}
