/**
 * Get the current user's ID from JWT token or localStorage.
 *
 * For admin:
 *   Decodes the "AccessTokenAdmin" JWT to extract user_id.
 *
 * For customer:
 *   Reads the "User" object from localStorage and extracts user_id.
 *
 * This is the SINGLE source of truth for determining the current user's ID.
 * Ownership comparisons (message.senderId === currentUserId) must use this.
 */

/**
 * Decode a JWT token's payload without verification.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get the current user's ID.
 *
 * Returns null if the user is not authenticated or the ID cannot be determined.
 */
export function getCurrentUserId(): number | string | null {
  // Try admin JWT first
  const adminToken = localStorage.getItem("AccessTokenAdmin");
  if (adminToken) {
    const payload = decodeJwtPayload(adminToken);
    if (payload) {
      const id = payload.user_id ?? payload.sub ?? payload.id ?? payload.userId;
      if (id != null) return id;
    }
  }

  // Try customer "User" object from localStorage FIRST (more reliable than JWT)
  // The User object contains the actual user_id from the API response,
  // while the JWT may use "sub" (a non-numeric string) instead of "user_id".
  try {
    const raw = localStorage.getItem("User");
    if (raw) {
      const user = JSON.parse(raw);
      // Check multiple possible field names
      const id = user?.user_id ?? user?.id ?? user?.userId;
      if (id != null) return id;
    }
  } catch {
    // ignore
  }

  // Try customer JWT as fallback
  const customerToken = localStorage.getItem("AccessToken");
  if (customerToken) {
    const payload = decodeJwtPayload(customerToken);
    if (payload) {
      // Only use JWT if it has a numeric user_id (not "sub" which is often a UUID/email)
      const id = payload.user_id ?? payload.id ?? payload.userId;
      if (id != null) return id;
    }
  }

  return null;
}
