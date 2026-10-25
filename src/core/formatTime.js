// Rāda 12.34 zem minūtes un 1:02.34 virs tās.
// Apgriež, nevis noapaļo, pēc WCA noteikumiem.
export function formatTime(ms) {
  const hundredths = Math.floor(ms / 10);
  const cs = String(hundredths % 100).padStart(2, '0');
  const totalSeconds = Math.floor(hundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${cs}`;
  }
  return `${seconds}.${cs}`;
}
