const authSocket = require("./middleware/authSocket");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const chatHistoryHandler = require("./socketHandlers/getMessageHistoryHandler");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const newMessageHandler = require("./socketHandlers/newMessageHandler");
const startTypingHandler = require("./socketHandlers/startTypingHandler");
const stopTypingHandler = require("./socketHandlers/stopTypingHandler");

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      method: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  io.on("connection", (socket) => {
    console.log("user connected");
    console.log(socket.id);

    // newConnectionHandler
    newConnectionHandler(socket, io);

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });

    socket.on("new-message", (data) => {
      newMessageHandler(socket, data, io);
    });

    socket.on("direct-chat-history", (data) => {
      chatHistoryHandler(socket, data);
    });

    socket.on("start-typing", (data) => {
      startTypingHandler(socket, data, io);
    });

    socket.on("stop-typing", (data) => {
      stopTypingHandler(socket, data, io);
    });
  });

  setInterval(() => {
    // emit online user
  }, [1000 * 8]);
};

module.exports = { registerSocketServer };
