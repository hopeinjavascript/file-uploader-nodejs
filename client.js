const net = require('net');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const helper = require('./helper');
const config = require('./config');

const CONNECTION_OBJECT = {
  host: config.HOST,
  port: config.PORT,
  timeout: 5000,
};

const socket = net.createConnection(CONNECTION_OBJECT, async () => {
  const filePath = process.argv[2];
  const fileName = path.basename(filePath);
  const fileSize = (await fsPromises.stat(filePath)).size;

  let bytesUploaded = 0;
  let percentageUploaded = 0;

  const rs = fs.createReadStream(filePath);

  socket.write(`${JSON.stringify({ fileName, fileSize })}`);

  console.log(); // * if in case... while moving the cursor up the line above it which we actually need also gets cleared!

  rs.on('data', async (data) => {
    if (!socket.write(data)) rs.pause();

    bytesUploaded += data.length;

    const newPercentageUploaded = ((bytesUploaded / fileSize) * 100).toFixed(2);

    // "newPercentageUploaded" because of Closures & many "data" events are getting fired
    helper.calculatePercentage(
      newPercentageUploaded,
      percentageUploaded,
      fileName
    );
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
