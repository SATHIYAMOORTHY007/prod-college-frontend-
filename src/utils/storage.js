const PREFIX = 'college-portal:'

/** localStorage can throw (private mode, blocked storage) — preferences are best-effort. */
export function readPreference(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writePreference(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore
  }
}
