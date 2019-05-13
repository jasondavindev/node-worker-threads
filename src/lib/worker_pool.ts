import { WorkerWrapper, WorkerStatus } from "./worker_wrapper";
import { Task } from "./task";
import { Worker } from "worker_threads";

export class WorkerPool<S, R> {
    private workers: { [key: number]: WorkerWrapper } = {};
    private taskQueue: Task<S, R>[] = [];

    constructor(private pathWorker: string, private numThreads: number) {}

    public async setup(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.numThreads > 0) {
                let countSuccess = 0,
                    countFailure = 0;

                for (let i = 0; i < this.numThreads; i++) {
                    const worker = (this.workers[i] = new WorkerWrapper());
                    worker.worker = new Worker(this.pathWorker);
                    worker.status = WorkerStatus.SPAWNING;

                    worker.worker.once(
                        "online",
                        (index => () => {
                            process.nextTick(() => {
                                this.workers[index].status = WorkerStatus.READY;
                                this.workers[index].worker.removeAllListeners();
                                countSuccess++;

                                if (
                                    countSuccess > 0 &&
                                    countSuccess === this.numThreads
                                ) {
                                    resolve();
                                }
                            });
                        })(i)
                    );

                    worker.worker.once(
                        "error",
                        (index => (error: Error) => {
                            process.nextTick(() => {
                                this.workers[index].status = WorkerStatus.OFF;
                                this.workers[index].worker.removeAllListeners();
                                countFailure++;

                                if (countFailure === this.numThreads) {
                                    reject(error);
                                }
                            });
                        })(i)
                    );
                }
            } else {
                reject('Number threads its necessary');
            }
        });
    }

    private getInactiveWorker(): number {
        for (let i = 0; i < this.numThreads; i++) {
            if (this.workers[i].status === WorkerStatus.READY) {
                return i;
            }
        }

        return -1;
    }

    public run(data: S) {
        return new Promise<R>((resolve, reject) => {
            const avaliableWorker = this.getInactiveWorker();

            const task: Task<S, R> = {
                data,
                callback: (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(result);
                }
            };

            if (avaliableWorker === -1) {
                this.taskQueue.push(task);
                return null;
            }

            this.runTask(avaliableWorker, task);
        });
    }

    private runTask(workerId: number, task: Task<S, R>) {
        const worker = this.workers[workerId];

        const messageCallback = (result: R) => {
            task.callback(null, result);
            cleanUp();
        };

        const errorCallback = (error: any) => {
            task.callback(error, null);
            cleanUp();
        };

        const cleanUp = () => {
            this.workers[workerId].status = WorkerStatus.READY;
            this.workers[workerId].worker.removeAllListeners();

            if (this.taskQueue.length > 0) {
                this.runTask(workerId, this.taskQueue.shift());
            }
        };

        worker.worker.once("message", messageCallback);
        worker.worker.once("error", errorCallback);

        worker.worker.postMessage(task.data);
        worker.status = WorkerStatus.BUSY;
    }

    public checkTaskQueue() {
        if (this.taskQueue.length === 0) {
            for (let i = 0; i < this.numThreads; i++) {
                if (this.workers[i].status === WorkerStatus.READY) {
                    this.workers[i].worker.terminate();
                    this.workers[i].status = WorkerStatus.OFF;
                }
            }
        }
    }
}
