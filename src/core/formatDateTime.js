// Atgriež datumu un laiku vietējā laika zonā formātā "2026-10-25 14:32:07".
/**
 * @param {number} ms
 * @returns {string} Formāts "YYYY-MM-DD HH:MM:SS".
 */
export function formatDateTime(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}