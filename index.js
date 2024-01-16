require('dotenv').config();

const protocol = process.env.PROTOCOL;
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
const port = process.env.PORT || 3000;

const myServer = createMyServer(protocol, app);
const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS);
const corsOptions = {
  origin: allowedOrigins,
}
const io = new Server(myServer, {
  cors: {
    origin: allowedOrigins,
    AccessControlAllowOrigin: allowedOrigins,
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

//issue: move the following function to another file
function createMyServer(protocol, app) {
  const myProtocol = require(protocol);
  if(protocol == 'http') {
    return myProtocol.createServer(app);
  }
  if(protocol == 'https') {
    return myProtocol.createServer({
  key: fs.readFileSync(path.join(__dirname, "certificates", "ssl-key.pem")), 
  cert: fs.readFileSync(path.join(__dirname, "certificates", "ssl-cert.pem")),
}, app);
  }
}

myServer.listen(port, () => {
  console.log(`My ${protocol} server is listening on port ${port}`);
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/home', express.static(path.join(__dirname, '..', 'cmp-lab-schedule', 'dist')));
//issue: the following rules are in place to fix the incorrect routing of the vite build. Figure out how to configure vite properly to advoid this issue systematically
app.use('/', express.static(path.resolve(__dirname, '..', 'cmp-lab-schedule/public')));
app.use('/home/src/img', express.static(path.resolve(__dirname, '..', 'cmp-lab-schedule/src/img')));
app.use('/src/img', express.static(path.resolve(__dirname, '..', 'cmp-lab-schedule/src/img')));



//issue: move the following class to a separate file
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
//end of issue

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
  const repo = req.query.repo;
  {
    switch (repo) {
    case 'backend':
      exec('git pull', (err, output) => {
        if(err) {
          res.send(err);
        }
        res.send(output);
      });
      break;
    case 'frontend':
      exec('cd ../cmp-lab-schedule && git pull', (err, output) => {
        if(err) {
          res.send(err);
        }
        res.send(output);
      });
      break;
    default:
      res.send('Can\'t find the repo');
    }
  }
});

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

app.get("*", (req, res) => {
  res.redirect('/home');
});//issue: Fallback route. The react router is not compatible with express router as of now.