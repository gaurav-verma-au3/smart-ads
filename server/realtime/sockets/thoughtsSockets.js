module.exports = (io) => {
  io.of("/api/socket").on("connection", (socket) => {
    console.log("socket.io: User connected: ", socket.id);

    socket.on("disconnect", () => {
      console.log("socket.io: User disconnected: ", socket.id);
    });
  });
};
