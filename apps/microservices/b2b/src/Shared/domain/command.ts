export interface Command {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(): Promise<any>;
}
