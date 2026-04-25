interface AppErrorParams {
  message: string;
  title?: string;
  subtitle?: string;
}

export class AppError extends Error {
  title: string;
  subtitle?: string;

  constructor({ message, title = 'Error', subtitle }: AppErrorParams) {
    super(message);
    this.title = title;
    this.subtitle = subtitle;
  }
}
