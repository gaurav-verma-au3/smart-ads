const express = require("./config/express.js"),
  mongoose = require("mongoose");
const thoughtsChangeStream = require("./realtime/changeStreams/thoughtsChangeStream.js");
cron = require("node-cron");

// Use env port or default
const port = process.env.PORT || 5000;

//establish socket.io connection
const app = express.init();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const thoughtsSockets = require("./realtime/sockets/thoughtsSockets");

thoughtsSockets(io);

//start the server
server.listen(port, () => console.log(`Server now running on port ${port}!`));

//connect to db
mongoose.connect(
  process.env.DB_URI || require("./config/example.config").db.uri,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connected");

  console.log("Setting change streams");
  thoughtsChangeStream(connection, io);
});

//schedule deletion of thoughts at midnight
cron.schedule("0 0 0 * * *", async () => {
  await connection.collection("thoughts").drop();

  io.of("/api/socket").emit("thoughtsCleared");
});

connection.on("error", (error) => console.log("Error: " + error));
