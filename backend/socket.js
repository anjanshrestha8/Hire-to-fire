const Message = require("./models/messages");

module.exports = (io) => {
  const codeRooms = {};
  const cursors = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", async (room) => {
      try {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);

        const history = await Message.findAll({
          where: { channel: room },
          order: [["createdAt", "ASC"]],
        });

        socket.emit("messageHistory", history);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    });

    socket.on("send-message", async ({ room, message }) => {
      try {
        console.log("Received message for room:", room, message);

        const saved = await Message.create({
          ...message,
          channel: room,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        io.to(room).emit("receiveMessage", saved);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("edit-message", async ({ room, id, content }) => {
      try {
        const message = await Message.findByPk(id);
        if (message) {
          message.content = content;
          message.updatedAt = new Date();
          await message.save();
          io.to(room).emit("message-edited", message);
        }
      } catch (error) {
        console.error("Error editing message:", error);
      }
    });

    socket.on("delete-message", async ({ room, id }) => {
      try {
        await Message.destroy({ where: { id } });
        io.to(room).emit("message-deleted", id);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    socket.on("channel-created", (channel) => {
      socket.broadcast.emit("channel-created", channel);
    });

    socket.on("channel-renamed", (channel) => {
      socket.broadcast.emit("channel-renamed", channel);
    });

    socket.on("channel-deleted", (id) => {
      socket.broadcast.emit("channel-deleted", id);
    });
    socket.on("joinCodeRoom", (room, callback) => {
      socket.join(room);
      const isFirstUser = !codeRooms[room];
      if (isFirstUser) {
        codeRooms[room] = "";
      }
      socket.emit("initDocument", codeRooms[room]);
      if (callback) callback(isFirstUser);
    });

    socket.on("codeChange", ({ room, code }) => {
      codeRooms[room] = code;
      socket.to(room).emit("updateCode", code);
    });

    socket.on("cursorChange", ({ room, userId, lineNumber, column }) => {
      if (!cursors[room]) cursors[room] = {};
      cursors[room][userId] = { lineNumber, column };
      socket.to(room).emit("updateCursor", { id: userId, lineNumber, column });
    });

    socket.on("leaveCodeRoom", (room, userId) => {
      socket.leave(room);
      if (cursors[room]) {
        delete cursors[room][userId];
        socket.to(room).emit("removeCursor", userId);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
