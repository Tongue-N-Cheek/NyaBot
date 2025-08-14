export function formatTime(time: number) {
	const hours = Math.floor(time / 60 / 60);
	const minutes = Math.floor(time / 60) - hours * 60;
	const seconds = time - hours * 60 * 60 - minutes * 60;

	if (hours + minutes + seconds === 0) return "0 seconds";

	return (hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "")
		+ (hours > 0 && minutes > 0 && seconds > 0 ? ", " : (hours > 0 && minutes + seconds > 0 ? " and " : ""))
		+ (minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "")
		+ (hours > 0 && minutes > 0 && seconds > 0 ? ", and " : (minutes > 0 && seconds > 0 ? " and " : ""))
		+ (seconds > 0 ? `${seconds} second${seconds > 1 ? "s" : ""}` : "");
}
