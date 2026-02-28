import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notifications_v2';

// Section keys
export const SECTIONS = {
  ATTENDANCE: 'Attendance',
  MARKS: 'Marks',
  FEES: 'Fees',
  HOMEWORK: 'Homework',
  NOTICES: 'Notices',
};

/**
 * Load all stored badge data
 * Returns: { Attendance: { seenAt, latestId }, Marks: {...}, ... }
 */
export async function loadBadges() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Mark a section as seen right now. Optionally store latest item ID.
 */
export async function markSeen(section, latestId = null) {
  try {
    const badges = await loadBadges();
    badges[section] = {
      seenAt: new Date().toISOString(),
      latestId: latestId !== null ? String(latestId) : (badges[section]?.latestId || null),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  } catch {}
}

/**
 * Determine if a section should show a green dot badge.
 *
 * @param badges - loaded badge data from loadBadges()
 * @param section - section name string
 * @param latestDate - ISO date string of most recent item in this section (optional)
 * @param latestId - ID of most recent item in this section (optional)
 */
export function shouldShowBadge(badges, section, latestDate = null, latestId = null) {
  const data = badges[section];

  // Never seen this section → always show badge
  if (!data?.seenAt) return true;

  // If we have a latest item date, compare it against last seen time
  if (latestDate) {
    try {
      const latest = new Date(latestDate);
      const seen = new Date(data.seenAt);
      if (latest > seen) return true;
    } catch {}
  }

  // If we have a latest item ID, compare against stored latestId
  if (latestId !== null && data.latestId !== null) {
    if (String(latestId) !== String(data.latestId)) return true;
  }

  // Fallback: show badge if not checked in 2 days (encourages daily engagement)
  const hoursSince = (Date.now() - new Date(data.seenAt)) / (1000 * 60 * 60);
  return hoursSince > 48;
}

/**
 * Clear all badges (call on logout)
 */
export async function clearAllBadges() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}
