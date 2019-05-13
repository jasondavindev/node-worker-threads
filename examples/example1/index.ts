process.env.UV_THREADPOOL_SIZE = '8';
import { WorkerPool } from '../../src/lib/worker_pool';
import * as path from 'path';

const NUM_THREADS = +process.argv[2];

const pool = new WorkerPool<number, number>(
    path.join(__dirname, './worker.js'),
    NUM_THREADS
);
pool.setup().then(() => {
    Promise.all(
        Array(100)
            .fill(100)
            .map(async val => {
                console.log(await pool.run(val));
            })
    ).then(() => {
        console.log('finished');
        pool.checkTaskQueue();
    });
});
