type TaskCallback<R> = (error: any, result?: R) => void;

export interface Task<S, R> {
    data: S;
    callback: TaskCallback<R>;
}
