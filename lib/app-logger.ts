export class AppLogger {
	private isDevelopment = process.env.NODE_ENV === "development";

	public log(message: any, ...args: any[]) {
		if (this.isDevelopment) {
			console.log(message, ...args);
		}
	}
	public error(message: any, ...args: any[]) {
		if (this.isDevelopment) {
			console.error(message, ...args);
		}
	}
	public alert(message: any, ) {
		if (this.isDevelopment) {
			alert(message,);
		}
	}
}

const logger = new AppLogger();
export default logger;
