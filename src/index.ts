process.env.UV_THREADPOOL_SIZE = '8';

import { WorkerPool } from './lib/worker_pool';
import * as path from 'path';

const pool = new WorkerPool<number, number>(path.join(__dirname, './worker.js'), 5);
const random = (min: number, max: number): number => Math.floor(Math.random() * (max - min) + min);

Promise.all(
	Array(400).fill(null).map(el => 100).map(async el => {
		console.log(await pool.run(el));
	}),
).then(() => {
	console.log('finished');
	pool.checkTaskQueue();
});