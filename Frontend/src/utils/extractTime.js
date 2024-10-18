export function extractTime(dateString) {
  
  
	const date = new Date(dateString);
	const hours = padZero(date.getHours());
	const minutes = padZero(date.getMinutes());
	return `${hours}:${minutes}`;
}

export function extractTimeDuration(dateString) {
  const createdDate = new Date(dateString).getTime(); // Get timestamp of the created date
  const nowDate = Date.now(); // Current timestamp

  const durationMs = nowDate - createdDate; // Difference in milliseconds

  // Convert milliseconds into readable time units
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  if (minutes > 0) return `${minutes} minute(s) ago`;
  return `${seconds} second(s) ago`;
}

// Helper function to pad single-digit numbers with a leading zero
function padZero(number) {
	return number.toString().padStart(2, "0");
}
