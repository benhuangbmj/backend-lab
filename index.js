const express = require('express');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const {createTask} = require('./databases/utilities/createTask');
const {selectAll} = require('./databases/utilities/selectAll');

const app = express();
const PORT = 3000;
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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

io.on('connection', (socket) => {
  times++;
  console.log('a user connected', times);
  socket.emit('initilize', curr);
  socket.on('input', (msg) => {
    curr = msg;
    io.emit('output', msg);
  });
});

app.post('/create-task', (req, res) => {
  createTask(req.body);
  res.end();
})

selectAll('progress', 'progress').then(res => console.log(res));