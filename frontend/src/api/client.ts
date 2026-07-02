import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

/** Shared, pre-configured axios instance for all backend calls. */
export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

/** Structured error envelope returned by the backend error middleware. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    request_id?: string | null;
    details?: unknown;
  };
}

/**
 * Normalise an unknown thrown value into a readable error message, preferring
 * the backend's structured error envelope when present.
 */
export function toApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) {
      return body.error.message;
    }
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return `Cannot reach the API at ${baseURL}. Start the backend with: cd backend && uvicorn app.main:app --reload`;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
