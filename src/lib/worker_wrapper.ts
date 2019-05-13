import { Worker } from 'worker_threads';

export enum WorkerStatus {
    SPAWNING,
    READY,
    BUSY,
    OFF
}

export class WorkerWrapper {
    public worker: Worker;
    public status: WorkerStatus;

    public initialize() {}
}
