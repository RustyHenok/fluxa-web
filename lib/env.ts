const DEFAULT_API_BASE_URL = "http://127.0.0.1:18080";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return trimTrailingSlash(
    process.env.FLUXA_API_BASE_URL ??
      process.env.NEXT_PUBLIC_FLUXA_API_BASE_URL ??
      DEFAULT_API_BASE_URL,
  );
}

