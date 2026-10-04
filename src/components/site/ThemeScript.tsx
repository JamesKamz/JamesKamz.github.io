/** Inline, render-blocking theme bootstrap to avoid a flash of the wrong theme. Dark by default. */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
