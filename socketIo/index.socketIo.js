const { Server } = require("socket.io");
const { createServer } = require("http");
const env = require("dotenv");
const cors = require("cors");
const { urlencoded, json } = require("express");
const app = require("express")();

const { Scoreboard } = require("./connection/scoreboard.connection");

const corsOptions = {
  origin: "*",
  methods: "GET, POST, PATCH, DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
env.config({ path: ".env" });
app.use(json());
app.use(urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const scoreboardIo = io.of("/scoreboard");

// scoreboardIo.on("connection", (socket) => {
//   socket.on("JOIN_ROOM", ({ roomId }) => {
//     console.log(roomId);
//     socket.join(roomId);

//     console.log(socket.rooms);
//     socket
//       .to([...socket.rooms])
//       .emit("MESSAGE", `SOCKET WITH ID: ${socket.id} JOINED`);
//   });
// });

new Scoreboard(scoreboardIo);

module.exports = { app, httpServer, io, scoreboardIo };
