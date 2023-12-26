const express = require('express');
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

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
  console.log(req.body);
  res.end();
})


const db = new sqlite3.Database('./databases/progress.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the progress database.');
  }
});

const {findMaxID} = require('./databases/utilities/findMaxID.js');
findMaxID(db, 'progress', 'task_id').then(res => console.log("max_id:", res));

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Closed the progress database.');
  }
});

