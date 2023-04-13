const net = require('net');
const fs = require('fs');

const config = {
  PORT: 7777,
  HOST: '::1', // ::1 ==>  localhost (IPv6)
};

const server = net.createServer();

// socket => client's endpoint => duplex stream
server.on('connection', (socket) => {
  console.count('New connection received');
  let ws;

  socket.on('data', (data) => {
    if (!ws) {
      // (1.)
      // in first socket.write from client(s) we are only going to receive metadata (we chose to send)
      // such as file name, file size. There is no actual data to write to the file.
      const metaData = JSON.parse(data);

      console.log(`Uploading ${metaData.fileName}...`);

      ws = fs.createWriteStream(`./storage/${metaData.fileName}`, {
        flags: 'w',
        encoding: 'utf-8',
      });

      // (2.)
      // Refer pt (1.) below is not needed because we are just extracting fileName(metadata) and there's nothing to write at this moment in time...
      // ws.write(data.subarray(indexOfSep + 7));

      // "drain" event is always on writable stream
      ws.on('drain', () => {
        console.log('drain-1');
        socket.resume(); // "resume" event is always on readable stream
      });

      ws.on('error', console.error);
    } else {
      if (!ws.write(data)) socket.pause(); // data => Buffer & "pause" event is always on readable stream
    }
  });

  socket.on('close', () => {
    console.log(`Server: Connection closed!`);
    if (ws) ws.close();
    process.exit(0); // 0 is for success & if not specified, it will use the code of process.exitCode property
  });

  socket.on('end', () => {
    console.log(`Server: Connection ended!`);
    if (ws) ws.end();
    ws = undefined; // if "undefined" is not assigned, the process will stuck...
  });
});

server.listen(config.PORT, config.HOST, () => {
  console.log('app is listening on', server.address());
});
