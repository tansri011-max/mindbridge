// Simple in-memory user session (no localStorage - sandboxed iframe restriction)
let currentUser: { id: number; name: string; email: string; university: string; year: string } | null = null;

export function setUser(user: typeof currentUser) {
  currentUser = user;
}

export function getUser() {
  return currentUser;
}

export function clearUser() {
  currentUser = null;
}

// Store last checkin result for results page
let lastCheckinResult: any = null;

export function setLastCheckinResult(result: any) {
  lastCheckinResult = result;
}

export function getLastCheckinResult() {
  return lastCheckinResult;
}
