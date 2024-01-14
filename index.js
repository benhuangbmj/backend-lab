require('dotenv').config();

const https = require(process.env.PROTOCOL);
const path = require('path');
const fs = require('fs');
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require('node:child_process')

const { selectAll } = require("./databases/utilities/selectAll");
const { createTask } = require("./databases/utilities/createTask");
const { updateTask } = require("./databases/utilities/updateTask");
const {utils: tools} = require('./utils/utils.js');
const {utils} = require("./databases/utilities/utils");
const { Shared } = require("./databases/utilities/shared");
const shared = new Shared();
const mainDatabase = shared.mainDatabase;

const app = express();
const PORT = process.env.PORT || 3000;
const httpsServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, "certificates", "ssl-key.pem")), 
  cert: fs.readFileSync(path.join(__dirname, "certificates", "ssl-cert.pem")),
}, app);
const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS);
const corsOptions = {
  origin: allowedOrigins,
}
const io = new Server(httpsServer, {
  cors: {
    origin: allowedOrigins,
    AccessControlAllowOrigin: allowedOrigins,
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});


httpsServer.listen(PORT, () => {
  console.log(`Https Server is listening on port ${PORT}`);
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//move the following class to a separate file
class SocketIo {
  constructor(io) {
    this.io = io;
    this.connections = 0;    
  }
  
  handleTasks(socket) {
    socket.on('fetchTasks', async (user) => {
      try {
        const supTasks = await utils.selectBySup(user);
        const userTasks = await utils.selectByUser(user);        
        socket.emit('receiveTasks', supTasks.concat(userTasks));
      } catch (err) {
        console.log(err);
        socket.emit('receiveTasks', err);
      }    
    })
  }
  
  handleConnect() {
    const io = this.io;
    io.on("connection", (socket) => {
      this.connections++;
      console.log(`One user just connects. ${this.connections} users are being connected.`);
      socket.on('disconnect', () => {
        this.connections--;
        console.log(`One user just disconnects. ${this.connections} users are being connected.`);
      });
      socket.on('start', (data) => {
        updateTask(mainDatabase, 'progress', data, io).then((sql) => {
          console.log('Updated sucessfully: ', sql);
        });
      });
      socket.on('pause', (data) => {
        updateTask(mainDatabase, 'progress', data).then(sql => {
          console.log('Updated sucessfully: ', sql);
          delete data.cumulative;
          data.in_progress = null;
          updateTask(mainDatabase, 'progress', data, io).then((sql) => {
            console.log('Updated sucessfully: ', sql);
          });
        });
      });
      socket.on('finish', (data) => {
        updateTask(mainDatabase, 'progress', data, io).then(sql => {
          console.log('Updated sucessfully: ', sql);
        })    
      });
      socket.on('resume', (data) => {
        updateTask(mainDatabase, 'progress', data, io).then(sql => {
          console.log('Updated sucessfully: ', sql);
        })    
      });
      for(let key of Object.getOwnPropertyNames(this.__proto__)) {
        if(!['constructor', 'handleConnect'].includes(key)) {
          this[key](socket);
        }
      }
    });    
  }
}

const myIo = new SocketIo(io);
myIo.handleConnect();

app.post("/create-task", (req, res) => {
  createTask(req.body);
  res.send(true);
});

app.get("/supervisees", async (req, res) => {
  const user = req.query.user;
  let supervisees = await utils.selectSupervisees(user);
  supervisees = supervisees.map(e => e.user);
  res.json(supervisees);
});

app.get('/deploy', (req, res) => {
  console.log('deploy!');
  exec('git pull', (err, output) => {
    if(err) {
      console.log(err);
    } else {
      console.log(output);
    }
  })
  res.end();
})

app.get("/", (req, res) => {
  const message = `<p style="color: green; width: fit-content; margin: auto; text-align: center">
  Backend Lab v0.5.0
  <br> 
  by Ben Huang
  <br> 
  Messiah University
  </p>`;
  res.send(message);
});