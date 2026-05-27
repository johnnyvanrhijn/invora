// Beheer de sidebar collapsed/expanded staat via een cookie.
// Server leest het bij initial render zodat we geen layout-shift krijgen.

export const SIDEBAR_COOKIE_NAME = 'invora_sidebar_collapsed'
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 jaar

export function getSidebarCollapsedFromCookie(cookieValue: string | undefined): boolean {
  return cookieValue === 'true'
}
