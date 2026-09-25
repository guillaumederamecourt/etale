const MIN_INTERVAL = 60000;
const PERIOD = 30 * 60000;
const RELOADED_KEY = 'etale.reloadedFor';

function cleanUrl() {
  if (new URLSearchParams(location.search).has('v')) history.replaceState(null, '', location.pathname + location.hash);
}

function reloadTo(id) {
  try {
    if (sessionStorage.getItem(RELOADED_KEY) === id) return;
    sessionStorage.setItem(RELOADED_KEY, id);
  } catch {}
  location.replace(`${location.pathname}?v=${encodeURIComponent(id)}`);
}

/** @param {() => boolean} canReload */
export function startUpdateCheck(canReload) {
  cleanUrl();
  if (import.meta.env.DEV) return () => {};

  let last = 0;
  const check = async () => {
    if (document.visibilityState !== 'visible' || Date.now() - last < MIN_INTERVAL) return;
    last = Date.now();
    try {
      const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
      const { id } = await r.json();
      if (id && id !== __BUILD_ID__ && canReload()) reloadTo(id);
    } catch {}
  };

  check();
  const timer = setInterval(check, PERIOD);
  document.addEventListener('visibilitychange', check);
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', check);
  };
}
