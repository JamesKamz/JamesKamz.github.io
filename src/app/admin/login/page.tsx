import { BrandIcon } from "@/components/icons/BrandIcon";
import { Zellige } from "@/components/site/Zellige";
import { buttonClass } from "@/components/ui/Button";
import { githubEnabled } from "@/auth";
import { githubLoginAction } from "./actions";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/admin";
  const error = typeof sp.error === "string" ? sp.error : null;
  return (
    <div className="relative isolate grid min-h-dvh place-items-center px-4">
      <Zellige id="zellige-login" className="-z-10 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="card w-full max-w-sm p-8">
        <span className="grid size-10 place-items-center rounded-lg bg-accent font-display font-bold text-accent-fg">JK</span>
        <h1 className="mt-6 font-display text-2xl font-semibold">Espace admin</h1>
        <p className="mt-1 text-sm text-muted">Accès réservé.</p>
        {error ? <p role="alert" className="mt-4 text-sm text-danger">Connexion refusée.</p> : null}
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
        {githubEnabled ? (
          <form action={githubLoginAction} className="mt-3">
            <button type="submit" className={buttonClass("secondary", "w-full")}>
              <BrandIcon brand="github" /> Continuer avec GitHub
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
