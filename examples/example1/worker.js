const { parentPort, threadId } = require('worker_threads');

/**
 * Simulates a complex task
 */
parentPort.on('message', (data) => {
	const randomTime = (Math.floor(Math.random() * 3) + 1) * 1000;
	setTimeout(
		() => parentPort.postMessage(`${threadId} -> ${randomTime}`),
		randomTime
	);
});
