const express = require("express");
const app = express();
const httpserver = require("http").createServer(app);
const { Server } = require("socket.io");
app.set("view engine", "ejs");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const client = new MongoClient("mongodb://localhost:27017/messages");

const io = new Server(httpserver);

app.get("/", (req, res) => {
  res.render("chat");
});

const users = new Array();
io.on("connection", (socket) => {
  socket.on("setUserName", (data) => {
    if (users.indexOf(data) > -1) {
      socket.emit("userExist", data + " username exist Try some other name...");
    } else {
      users.push(data);
      socket.emit("userset", { username: data });
    }
  });

  socket.on("message", (data) => {
    console.log("received data:--->", data);
    socket.broadcast.emit("newclientconnect", data);
  });
  socket.on("msg", (data) => {
    client
      .db()
      .collection("chat")
      .insertOne({ name: data.userName, message: data.msg });
    io.sockets.emit("newMsg", data);
  });
  socket.on("clearChat",()=>{
    client.db().collection("chat").drop().catch(()=>{console.log("data alredy clear")})
  })
  socket.on("getdata",() => {
     client
      .db()
      .collection("chat")
      .find()
      .toArray((err, data) => {
        if (err) {
          console.log("error occured");
        } else {
          socket.emit("datahere", data);
        }
      });
  });
});
httpserver.listen(4001, () => {
  console.log("server started!");
});
