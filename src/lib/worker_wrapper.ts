import { Worker } from 'worker_threads';

export enum WorkerStatus {
    SPAWNING,
    READY,
    BUSY,
    OFF
}

export class WorkerWrapper {
    worker: Worker;
    status: WorkerStatus;
}
