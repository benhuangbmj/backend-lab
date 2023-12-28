const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const { createTask } = require("./databases/utilities/createTask");
const { selectAll } = require("./databases/utilities/selectAll");
const { updateTask } = require("./databases/utilities/updateTask");

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

let times = 0;

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  times++;
  console.log("a user connected", times);
  socket.on("fetchDisplay", () => {
    selectAll('progress', 'progress')
      .then((data) => {
        socket.emit("receiveDisplay", data);
      })
      .catch((err) => {
        socket.emit("receiveDisplay", err);
      });
  });
  socket.on('start', (data) => {
    updateTask('progress', 'progress', data, io).then((sql) => {
      console.log('Updated sucessfully: ', sql);
    });
  });
  socket.on('pause', (data) => {
    updateTask('progress', 'progress', data).then(sql => {
      console.log('Updated sucessfully: ', sql);
      delete data.cumulative;
      data.in_progress = null;
      updateTask('progress', 'progress', data, io).then((sql) => {
        console.log('Updated sucessfully: ', sql);
      });
    });
  });
  socket.on('finish', (data) => {
    updateTask('progress', 'progress', data, io).then(sql => {
      console.log('Updated sucessfully: ', sql);
    })    
  });
  socket.on('resume', (data) => {
    updateTask('progress', 'progress', data, io).then(sql => {
      console.log('Updated sucessfully: ', sql);
    })    
  });
});

app.post("/create-task", (req, res) => {
  createTask(req.body);
  res.end();
});
