const http = require('http');
const cors = require('cors');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const url= req.url;
    const method = req.method;
    if(method === 'POST' && url === '/Register') {
        let requestBody = '';
        req.on('data', (chunk) => {
            requestBody += chunk.toString();
        });

        req.on('end', async () => {
            const postData = JSON.parse(requestBody);
            console.log(requestBody);
            const email=postData.email;
            const username = postData.username;
            const password = postData.password;

            console.log('Received data:', username, password, email);


            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Data received successfully.' }));
        });
    }else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`Method: ${req.method}, URL: ${req.url}`);
        }
    });

const port = 8765;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
