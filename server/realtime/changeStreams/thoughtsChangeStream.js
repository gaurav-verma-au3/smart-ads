module.exports = (connection, io) => {
  const thoughtChangeStream = connection.collection("thoughts").watch();
  thoughtChangeStream.on("change", (change) => {
    switch (change.operationType) {
      case "insert":
        const thought = {
          _id: change.fullDocument._id,
          name: change.fullDocument.name,
          description: change.fullDocument.description,
        };

        io.of("/api/socket").emit("newThought", thought);
        break;

      case "delete":
        io.of("/api/socket").emit("deletedThought", change.documentKey._id);
        break;
    }
  });
};
