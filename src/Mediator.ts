export interface Mediator<T> {
  abort(reason?: Error): void;
  get promise(): Promise<T>;
}