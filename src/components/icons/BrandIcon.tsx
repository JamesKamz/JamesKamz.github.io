import { brandPaths, type Brand } from "./brand-paths";

export function BrandIcon({ brand, className = "size-4" }: { brand: Brand; className?: string }) {
  if (brand === "comeup") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M15.6 9.2a4.2 4.2 0 1 0 0 5.6l-1.5-1.3a2.2 2.2 0 1 1 0-3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d={brandPaths[brand]} />
    </svg>
  );
}
