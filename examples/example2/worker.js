const { parentPort, threadId } = require('worker_threads');

parentPort.on('message', data => {
	setTimeout(() => {
        console.log(threadId);
		parentPort.postMessage(Date.now());
	}, data * 1000);
});
