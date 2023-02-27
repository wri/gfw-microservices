export interface Command {
    execute(): Promise<any>;
}
