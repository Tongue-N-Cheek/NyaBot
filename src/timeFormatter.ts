export function formatTime(time: number) {
	const hours = Math.floor(time / 60 / 60);
	const minutes = Math.floor(time / 60) - hours * 60;
	const seconds = time - hours * 3600 - minutes * 60;

	if (hours + minutes + seconds === 0) return "0 seconds";

	return (hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "")
		+ (hours > 0 && minutes > 0 && seconds > 0 ? ", " : (hours > 0 && minutes + seconds > 0 ? " and " : ""))
		+ (minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "")
		+ (hours > 0 && minutes > 0 && seconds > 0 ? ", and " : (minutes > 0 && seconds > 0 ? " and " : ""))
		+ (seconds > 0 ? `${seconds} second${seconds > 1 ? "s" : ""}` : "");
}

const timeRegex = /\d{1,2}(?::\d\d){0,2} ?(?:am|pm)?/;
export function parseTime(time: string) {
	time = time.trim().toLowerCase();
	if (time.match(timeRegex)?.[0] !== time) return undefined;

	const afternoon = time.endsWith("pm");
	if (afternoon || time.endsWith("am")) time = time.slice(0, -2).trim();

	let [hours, minutes, seconds] = time.split(":").map(Number);

	hours ??= 0;
	minutes ??= 0;
	seconds ??= 0;

	hours = Math.floor(Math.min(Math.max(hours, 0), 24));
	if (afternoon && hours < 12) hours += 12;

	minutes = Math.floor(Math.min(Math.max(minutes, 0), 59));
	seconds = Math.floor(Math.min(Math.max(seconds, 0), 59));

	return hours * 3600 + minutes * 60 + seconds;
}
