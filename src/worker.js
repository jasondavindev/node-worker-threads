const { parentPort } = require('worker_threads');

parentPort.on('message', data => {
	parentPort.postMessage(fibonnaci(data));
});

function fibonnaci(n) {
	if (n <= 1) {
		return 1;
	}

	return n * fibonnaci(n - 1);
}
