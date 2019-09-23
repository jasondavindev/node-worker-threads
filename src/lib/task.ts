type TaskCallback<R> = (error: any, result?: R) => void;

export interface ITask<S, R> {
	data: S;
	callback: TaskCallback<R>;
}
