const net = require('net');
const fs = require('fs');

const config = {
  CONNECTION_OBJECT: {
    host: '::1', // ::1 ==>  localhost (IPv6)
    port: 7777,
    timeout: 5000,
  },
};

const socket = net.createConnection(config.CONNECTION_OBJECT, async () => {
  const rs = fs.createReadStream('./text.txt');

  rs.on('data', (data) => {
    if (!socket.write(data)) rs.pause();
  });

  socket.on('drain', () => {
    rs.resume();
  });

  rs.on('error', console.error);

  rs.on('close', () => {
    console.log(`Client: Read Stream closed`);
  });

  rs.on('end', () => {
    console.log(`The file was successfully uploaded!`);
    console.log(`Client: Read Stream ended.`);
    socket.end();
  });
});
