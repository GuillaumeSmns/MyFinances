import { MOCK_AUTH_COOKIE, MOCK_AUTH_VALUE } from "@/lib/mock-auth-constants";

export { MOCK_AUTH_COOKIE, MOCK_AUTH_VALUE } from "@/lib/mock-auth-constants";

const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function setMockAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${MOCK_AUTH_COOKIE}=${MOCK_AUTH_VALUE}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}

export function clearMockAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${MOCK_AUTH_COOKIE}=; path=/; max-age=0`;
}

export function hasMockAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => {
    const [name, ...rest] = part.trim().split("=");
    return name === MOCK_AUTH_COOKIE && rest.join("=") === MOCK_AUTH_VALUE;
  });
}
