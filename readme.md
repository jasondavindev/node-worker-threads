# Node Worker Threads

It's a basic library for works with Node.js threads. This library provides a worker pool with `n` workers _(based on how many cores your CPU has)_.

#### Node.js Threads

Node.js provides a way for works with non-clustered threads.

The **worker_threads** module enables the use of threads that execute JavaScript in parallel.

## WorkerPool

### constructor<T, K>(javascriptFile, numWorkers)

- `T` **any**: input data type. T will be transferred in a way which is compatible with the [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).
- `K` **any**: output data type
- `javascriptFile` **string**: path to Javascript script file
- `numWorkers` **number**: amount of workers

```
const workerPool = new WorkerPool<number, string>('script.js', 4);
```

The Javascript script example:

```
const { parentPort, threadId } = require('worker_threads');

/**
 * Simulates a complex task
 */

// The type of the data param must be the same as indicated in T
parentPort.on('message', (data) => {
	const randomTime = (Math.floor(Math.random() * 3) + 1) * 1000;
	setTimeout(
    	// The type of argument must be the same as indicated in K
		() => parentPort.postMessage(`${threadId} -> ${randomTime}`),
		randomTime
	);
});

```

### setup()

Instantiates the workers. It's necessary before any task starts.

```
const workerPool = new WorkerPool<number, string>('script.js', 4);
await workerPool.setup();
```

### run(data)

- data **T**: input data for task. Generic `T` is defined on class constructor.

```
const workerPool = new WorkerPool<number, string>('script.js', 4);
await workerPool.setup();
const result = await workerPool.run(100);
```
