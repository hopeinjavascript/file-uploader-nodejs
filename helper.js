const fs = require('fs');

const clearLine = (dir) => {
  return new Promise((resolve, _) => {
    process.stdout.clearLine(dir, resolve);
  });
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve, _) => {
    process.stdout.moveCursor(dx, dy, resolve);
  });
};

module.exports.calculatePercentage = async function calculatePercentage(
  newPercentageUploaded,
  percentageUploaded,
  fileName
) {
  if (newPercentageUploaded !== percentageUploaded) {
    percentageUploaded = newPercentageUploaded;
    await moveCursor(0, -1);
    await clearLine(0);
    if (percentageUploaded < 100)
      console.log(`Uploading ${fileName}... ${percentageUploaded}%`);
    else
      console.log(`Uploaded ${fileName}... ${Math.trunc(percentageUploaded)}%`);
  }
};
