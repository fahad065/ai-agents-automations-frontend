// Cookie consent state. Essential cookies (login session, UI preferences)
// never need consent; anything non-essential — today only Google Analytics —
// must not load until the visitor opts in, and must stop if they opt out.
//
// Bump CONSENT_VERSION when the set of non-essential cookies changes (e.g. a
// marketing pixel is added) so every visitor is asked again.

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "lm_cookie_consent";
export const OPEN_SETTINGS_EVENT = "lm_open_cookie_settings";

export interface ConsentState {
  version: number;
  analytics: boolean;
  decidedAt: string;
}

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentState {
  const state: ConsentState = { version: CONSENT_VERSION, analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: the choice applies for this page view only, and the
    // banner asks again next visit — analytics stays off unless accepted.
  }
  return state;
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}

// Google Analytics sets _ga and _ga_<id> on the site's registrable domain
// (".logicmate.io"), so expire them on every parent domain of this host.
export function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_gat");
  const parts = window.location.hostname.split(".");
  const domains = [""].concat(parts.map((_, i) => "." + parts.slice(i).join(".")));
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
