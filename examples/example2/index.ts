process.env.UV_THREADPOOL_SIZE = '8';
import { WorkerPool } from '../../src/lib/worker_pool';
import { join } from 'path';

const NUM_THREADS = +process.argv[2];

if (!NUM_THREADS) {
	throw Error('Number threads its necessary');
}

const random = (min: number, max: number): number => Math.floor(Math.random() * (max - min) + min);
const pool = new WorkerPool<number, number>(join(__dirname, './worker.js'), NUM_THREADS);

Promise.all(
	Array(8).fill(1).map(val => random(1, 5)).map(async val => {
        const start = Date.now();
		console.log(await pool.run(val) - start);
	}),
).then(() => {
    pool.checkTaskQueue();
    console.log('finished')
});
