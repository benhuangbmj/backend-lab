const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
 cors: {
  origin: "*", // Specify your front-end origin
  AccessControlAllowOrigin: "*",
  allowedHeaders: ["Access-Control-Allow-Origin"],
  credentials: true,
 },
});

let curr = '';
let times = 0;

httpServer.listen(PORT, () => {
 console.log(`Server is listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  times++;
  console.log('a user connected', times);
  socket.emit('initilize', curr);
  socket.on('input', (msg) => {
    curr = msg;
    io.emit('output', msg);
  });
});