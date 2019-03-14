const path = require("path");
const bird = require("../src/providers/bird.js");
const Metrics = require("../src/metrics.js");
const level = require("level");
const through2 = require("through2");

var provider = "bird";
var store = level(path.join(__dirname, "../data"));
var metrics = new Metrics(store);
var tripCount = 0;
var changeCount = 0;
var start = 1552351799 - 60 * 60 * 24 * 15;
var stop = 1552351799;

var tripStream = through2.obj((trip, enc, next) => {
  metrics.trip(trip, provider, () => {
    tripCount++;
    log();
    next();
  });
});

var changeStream = through2.obj((change, enc, next) => {
  metrics.change(change, provider, () => {
    changeCount++;
    log();
    next();
  });
});

tripStream.on("finish", () => {
  bird.changes(changeStream, start, stop);
});

changeStream.on("finish", () => {
  console.log("complete.");
});

bird.trips(tripStream, start, stop);

function log() {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    tripCount +
      " trips processed -- " +
      changeCount +
      " status changes processed"
  );
}
