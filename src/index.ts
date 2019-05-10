import { WorkerPool } from './lib/worker_pool';
import * as path from 'path';

const pool = new WorkerPool<number, number>(path.join(__dirname, './worker.js'), 8);
Promise.all(
    Array(20).fill(null)
        .map(el => Math.floor(Math.random() * 10) + 1)
        .map(async (el) => {
            const rs = await pool.run(el);
            console.log(rs);
        })
).then(() => {
    console.log('finished');
})
pool.run(5).then(fibo => {
	console.log(fibo);
});
// pool.checkTaskQueue();