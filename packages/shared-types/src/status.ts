/**
 * The Cut-over freeze. While the old app is kept read-only beside the new one,
 * the server refuses every write with a 503 carrying this code, and the client
 * shows this message for it.
 */
export const READ_ONLY_CODE = "READ_ONLY";

export const READ_ONLY_MESSAGE =
  "Sunday Heroes has moved to sunday-heroes.app. This copy is read-only.";

/** `GET /api/status`: what the client needs to know before anyone signs in. */
export interface StatusResponse {
  readOnly: boolean;
}

/**
 * The body of the 503 a write gets while the app is read-only. The message is
 * in both `message` and `error` because the client's error paths read one or
 * the other.
 */
export interface ReadOnlyErrorResponse {
  code: typeof READ_ONLY_CODE;
  message: string;
  error: string;
}
