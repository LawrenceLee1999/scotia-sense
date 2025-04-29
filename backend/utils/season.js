export function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 6 = July

  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}
