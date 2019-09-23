process.env.UV_THREADPOOL_SIZE = '8';
import { WorkerPool } from '../../src/lib/worker_pool';
import * as path from 'path';

const NUM_THREADS = parseInt(process.argv[2], 10) || 0;

(async () => {
	const pool = new WorkerPool<number, string>(
		path.join(__dirname, './worker.js'),
		NUM_THREADS
	);

	await pool.setup();
	const tasks = Array(10).fill(100);
	const scheduler = await Promise.all(
		tasks.map(async (value) => await pool.run(value))
	);
	// pool.checkTaskQueue();
	console.log(scheduler);
})();
