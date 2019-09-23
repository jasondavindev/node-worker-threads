import { Worker } from 'worker_threads';

export enum WorkerStatus {
	SPAWNING,
	READY,
	BUSY,
	OFF,
}

export class WorkerWrapper {
	constructor(public worker: Worker, public status: WorkerStatus) {}
}
