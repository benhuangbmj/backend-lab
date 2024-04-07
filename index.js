require("dotenv").config();

const protocol = process.env.PROTOCOL;
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("node:child_process");
const _ = require("lodash");
const cron = require("node-cron");
const passport = require("passport");
const session = require("express-session");

const { selectAll } = require("./databases/utilities/selectAll");
const { createTask } = require("./databases/utilities/createTask");
const { updateTask } = require("./databases/utilities/updateTask");
const tools = require("./utils/utils.js");
const { utils } = require("./databases/utilities/utils");
const { Shared } = require("./databases/utilities/shared");
const shared = new Shared();
const mainDatabase = shared.mainDatabase;

cron.schedule(
  "59 23 * * *",
  () => {
    try {
      tools.backupUsers();
    } catch (err) {
      console.error(err);
    }
    try {
      utils.updateUsage();
    } catch (err) {
      console.error(err);
    }
  },
  {
    timezone: "America/New_York",
  },
);

const app = express();
const port = process.env.PORT || 3000;

const myServer = createMyServer(protocol, app);
const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS);
const corsOptions = {
  origin: allowedOrigins,
};
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
  if (protocol == "http") {
    return myProtocol.createServer(app);
  }
  if (protocol == "https") {
    return myProtocol.createServer(
      {
        key: fs.readFileSync(process.env.KEY_PATH),
        cert: fs.readFileSync(process.env.CERT_PATH),
      },
      app,
    );
  }
}
myServer.listen(port, () => {
  console.log(`My ${protocol} server is listening on port ${port}`);
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: "text/plain" }));
app.use(
  "/",
  express.static(path.join(__dirname, "..", "cmp-lab-schedule", "dist")),
);
//issue: the following rules are in place to fix the incorrect routing of the vite build. Figure out how to configure vite properly to avoid this issue systematically
app.use(
  "/src/img",
  express.static(path.resolve(__dirname, "..", "cmp-lab-schedule/src/img")),
);
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //how to make this work?
      httpOnly: false,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
var MicrosoftStrategy = require("passport-microsoft").Strategy;
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
      scope: ["user.read"],
      tenant: "common",
      authorizationURL:
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    },
    function (accessToken, refreshToken, profile, done) {
      const regexUsername = /[\w\W]+(?=@)/;
      const regexDomain = /(?<=@)[\w\W]+/;
      const username = profile.userPrincipalName.match(regexUsername)[0];
      const domain = profile.userPrincipalName.match(regexDomain)[0];
      console.log(username, domain);
      return done(null, profile);
    },
  ),
);
app.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {
    prompt: "select_account",
  }),
);

app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/about" }),
  function (req, res) {
    res.redirect("/");
  },
);

//issue: move the following class to a separate file
class SocketIo {
  constructor(io) {
    this.io = io;
    this.connections = 0;
  }

  handleTasks(socket) {
    socket.on("fetchTasks", async (user) => {
      try {
        const supTasks = await utils.selectBySup(user);
        const userTasks = await utils.selectByUser(user);
        socket.emit("receiveTasks", supTasks.concat(userTasks));
      } catch (err) {
        console.log(err);
        socket.emit("receiveTasks", err);
      }
    });
  }

  handleBackup(socket) {
    socket.on("backup", () => {
      console.log("backup!");
      socket.emit("backup complete");
    });
  }

  handleConnect() {
    const io = this.io;
    io.on("connection", (socket) => {
      this.connections++;
      console.log(
        `One user just connects. ${this.connections} users are being connected.`,
      );
      socket.on("disconnect", () => {
        this.connections--;
        console.log(
          `One user just disconnects. ${this.connections} users are being connected.`,
        );
      });
      socket.on("start", (data) => {
        updateTask(mainDatabase, "progress", data, io).then((sql) => {
          console.log("Updated sucessfully: ", sql);
        });
      });
      socket.on("pause", (data) => {
        updateTask(mainDatabase, "progress", data).then((sql) => {
          console.log("Updated sucessfully: ", sql);
          delete data.cumulative;
          data.in_progress = null;
          updateTask(mainDatabase, "progress", data, io).then((sql) => {
            console.log("Updated sucessfully: ", sql);
          });
        });
      });
      socket.on("finish", (data) => {
        updateTask(mainDatabase, "progress", data, io).then((sql) => {
          console.log("Updated sucessfully: ", sql);
        });
      });
      socket.on("resume", (data) => {
        updateTask(mainDatabase, "progress", data, io).then((sql) => {
          console.log("Updated sucessfully: ", sql);
        });
      });
      for (let key of Object.getOwnPropertyNames(this.__proto__)) {
        if (!["constructor", "handleConnect"].includes(key)) {
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
  createTask(req.body, io);
  res.send(true);
});

app.post("/edit-task", (req, res) => {
  updateTask(mainDatabase, "progress", req.body, io);
  res.send(true);
});

app.get("/supervisees", async (req, res) => {
  const user = req.query.user;
  let supervisees = await utils.selectSupervisees(user);
  supervisees = supervisees.map((e) => e.user);
  res.json(supervisees);
});

app.post("/upload-usage", async (req, res) => {
  const columns = req.body.meta.fields;
  const dataset = req.body.data;
  const db = await utils.openDatabase(mainDatabase);
  db.serialize(function () {
    db.get(
      `SELECT name FROM sqlite_master WHERE type="table" AND name="usage"`,
      (err, row) => {
        if (err) console.log(err);
        else if (!row) utils.createTable(db, "usage", columns);
      },
    );
    db.parallelize(function () {
      dataset.forEach((e) => {
        utils.insertToTable({
          db: db,
          tbName: "usage",
          row: e,
          callback: () => {},
          remainOpen: true,
        });
      });
    });
    db.close((err) => {
      if (!err) {
        console.log("Closed the database.");
      }
    });
  });
});

app.get("/usage", async (req, res) => {
  try {
    const output = await utils.selectAll(mainDatabase, "usage");
    output && res.json(output);
  } catch (e) {
    console.error(e);
    res.json(null);
  }
});

app.get("/about", (req, res) => {
  const message = `<p style="color: green; width: fit-content; margin: auto; text-align: center">
  Backend Lab v0.6.0
  <br> 
  by Ben Huang
  <br> 
  Messiah University
  </p>`;
  res.send(message);
});

app.post("/delete-task", (req, res) => {
  utils.deleteTask(req.body, io);
});

app.get("*", (req, res) => {
  res.redirect("/");
}); //issue: Fallback route. The react router is not compatible with express router as of now.

/*
app.get("/deploy", (req, res) => {
  const repo = req.query.repo;
  {
    switch (repo) {
      case "backend":
        exec("git pull", (err, output) => {
          if (err) {
            res.send(err);
          }
          res.send(output);
        });
        break;
      case "frontend":
        exec(
          "cd ../cmp-lab-schedule && git pull && npm run build",
          (err, output) => {
            if (err) {
              res.send(err);
            }
            res.send(output);
          },
        );
        break;
      default:
        res.send("Can't find the repo");
    }
  }
});
*/
