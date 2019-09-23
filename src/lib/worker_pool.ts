import { WorkerWrapper, WorkerStatus } from 'lib/worker_wrapper';
import { ITask } from 'lib/task';
import { Worker } from 'worker_threads';

/**
 * WorkerPool
 * @param T is the input task type
 * @param K is the expected output task type
 */
export class WorkerPool<T, K> {
	private workers: { [key: number]: WorkerWrapper } = {};
	private taskQueue: Array<ITask<T, K>> = [];

	constructor(private javascriptFile: string, private numWorkers: number) {
		if (this.numWorkers < 1) {
			throw new Error('Threads number its necessary');
		}

		console.log(this.numWorkers);
	}

	/**
	 * Start all workers of worker pool
	 */
	public async setup(): Promise<void> {
		return new Promise((resolve, reject) => {
			let countSuccess = 0;
			let countFailure = 0;

			for (let i = 0; i < this.numWorkers; i++) {
				this.workers[i] = new WorkerWrapper(
					new Worker(this.javascriptFile),
					WorkerStatus.SPAWNING
				);

				const { worker } = this.workers[i];

				worker.once(
					'online',
					((index) => () => {
						process.nextTick(() => {
							this.workers[index].status = WorkerStatus.READY;
							this.workers[index].worker.removeAllListeners();
							countSuccess++;

							if (countSuccess > 0 && countSuccess === this.numWorkers) {
								resolve();
							}
						});
					})(i)
				);

				worker.once(
					'error',
					((index) => (error: Error) => {
						process.nextTick(() => {
							this.workers[index].status = WorkerStatus.OFF;
							this.workers[index].worker.removeAllListeners();
							countFailure++;

							if (countFailure === this.numWorkers) {
								reject(error);
							}
						});
					})(i)
				);
			}
		});
	}

	/**
	 * Create a task and schedule
	 * @param data any input data
	 */
	public run(data: T): Promise<K> {
		return new Promise((resolve, reject) => {
			const task: ITask<T, K> = {
				data,
				callback: (error, result?: K): void => {
					if (error) {
						return reject(error);
					}

					resolve(result);
				},
			};

			this.scheduleTask(task);
			this.tick();
		});
	}

	/**
	 * Kill workers if there are not tasks
	 */
	public killWorkers(): void {
		for (let i = 0; i < this.numWorkers; i++) {
			if (this.workers[i].status === WorkerStatus.READY) {
				this.workers[i].worker.terminate();
				this.workers[i].status = WorkerStatus.OFF;
			}
		}
	}

	/**
	 * Schedule a task for worker pool
	 * @param task Task
	 */
	private scheduleTask(task: ITask<T, K>) {
		this.taskQueue.push(task);
	}

	/**
	 * Start a task
	 * @param workerId number of worker
	 * @param task any task
	 */
	private runTask(workerId: number, task: ITask<T, K>) {
		const { worker } = this.workers[workerId];

		const messageCallback = (result: K) => {
			task.callback(null, result);
			this.cleanUp(workerId);
		};

		const errorCallback = (error: any) => {
			task.callback(error);
			this.cleanUp(workerId);
		};

		worker.once('message', messageCallback);
		worker.once('error', errorCallback);

		worker.postMessage(task.data);
		this.workers[workerId].status = WorkerStatus.BUSY;
	}

	/**
	 * Reset worker for the next task
	 * @param workerId worker number
	 */
	private cleanUp(workerId: number) {
		const worker = this.workers[workerId];
		worker.status = WorkerStatus.READY;
		worker.worker.removeAllListeners();
		this.tick();
	}

	/**
	 * Worker pool manager. Gives workers a task
	 */
	private tick(): void {
		if (!this.hasTaks()) {
			this.killWorkers();
			return;
		}

		const avaliableWorker = this.getAvaliableWorker();

		if (avaliableWorker === -1) {
			return;
		}

		const task = this.taskQueue.shift();

		if (task) {
			this.runTask(avaliableWorker, task);
		}
	}

	/**
	 * Returns a worker who is ready for the next task
	 * Returns -1 whether there are not a avaliable worker
	 */
	private getAvaliableWorker(): number {
		for (let i = 0; i < this.numWorkers; i++) {
			if (this.workers[i].status === WorkerStatus.READY) {
				return i;
			}
		}

		return -1;
	}

	private hasTaks(): boolean {
		return this.taskQueue.length > 0;
	}
}
