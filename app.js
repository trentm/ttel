const http = require('http');

const server = http.createServer(function onRequest(req, res) {
    console.log('SERVER req: %s %s', req.method, req.url);
    req.resume();
    req.on('end', function () {
        const body = 'pong';
        res.writeHead(200, {
            'content-type': 'text/plain',
            'content-length': Buffer.byteLength(body),
        });
        res.end(body);
    });
});

server.listen(0, '127.0.0.1', async function () {
    const port = server.address().port;

    // Make one request the `http`.
    await new Promise((resolve) => {
        const clientReq = http.request(
            `http://127.0.0.1:${port}/http.request`,
            function (cres) {
                console.log('CLIENT(http.request) res: %s', cres.statusCode);
                cres.resume();
                cres.on('end', resolve);
            }
        );
        clientReq.end();
    });

    // Make second request with undici.
    const res = await fetch(`http://127.0.0.1:${port}/fetch`);
    console.log('CLIENT(fetch) res: %s', res.status);
    await res.bytes();

    server.close();
});
