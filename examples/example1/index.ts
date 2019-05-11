process.env.UV_THREADPOOL_SIZE = '8';
const NUM_THREADS = +process.argv[2];

if (!NUM_THREADS) {
	throw Error('Number threads its necessary');
}

import { WorkerPool } from '../../src/lib/worker_pool';
import * as path from 'path';

const pool = new WorkerPool<number, number>(path.join(__dirname, './worker.js'), NUM_THREADS);

Promise.all(
	Array(100).fill(100).map(async val => {
		console.log(await pool.run(val));
	}),
).then(() => {
	console.log('finished');
	pool.checkTaskQueue();
});
