const net = require('net');
const fs = require('fs');

const config = {
  PORT: 7777,
  HOST: '::1', // ::1 ==>  localhost (IPv6)
};

const server = net.createServer();

// socket => client's endpoint => duplex stream
server.on('connection', (socket) => {
  console.log('connection received');

  // not a good practice => it will be created upon every connection
  const ws = fs.createWriteStream('./storage/test.txt', {
    flags: 'w',
    encoding: 'utf-8',
  });

  socket.on('data', (data) => {
    // data => Buffer
    if (!ws.write(data)) socket.pause(); // "pause" event is always on readable stream
  });

  // "drain" event is always on writable stream
  ws.on('drain', () => {
    socket.resume(); // "resume" event is always on readable stream
  });

  ws.on('error', console.error);

  socket.on('close', () => {
    console.log(`Server: Connection closed!`);
    ws.close();
  });

  socket.on('end', () => {
    console.log(`Server: Connection ended!`);
    ws.end();
  });
});

server.listen(config.PORT, config.HOST, () => {
  console.log('app is listening on', server.address());
});
