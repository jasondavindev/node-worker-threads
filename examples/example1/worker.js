const { parentPort, threadId } = require('worker_threads');
const { pbkdf2 } = require('crypto');

parentPort.on('message', data => {
    pbkdf2('a', 'b', 1000 * data, 512, 'sha512', () => {
        parentPort.postMessage(threadId);
    });
});

function fibonnaci(n) {
    if (n <= 1) {
        return 1;
    }

    return n * fibonnaci(n - 1);
}
