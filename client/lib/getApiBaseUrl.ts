const FALLBACK_API_URL = "http://localhost:4000";

export function getApiBaseUrl() {
  return (
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    FALLBACK_API_URL
  );
}

