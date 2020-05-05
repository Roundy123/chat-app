const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PORT = process.env.PORT || 4001;
const cors = require("cors");
const http = require("http");
app.use(cors());
app.use(express.json());
const ioServer = http.createServer(app);
const socketIo = require("socket.io")(ioServer, { origins: "*:*" });
const path = require("path");

socketIo.on("connection", () => {
  socketIo.emit("hello", "can you hear me?", 1, 2, "abc");
  console.log("a user is connected");
});

const messageSchema = new Schema({
  name: String,
  message: String,
});

const Message = mongoose.model("Message", messageSchema);

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    if (err) {
      res.send(err);
    } else {
      res.send(messages);
    }
  });
});

app.post("/messages", (req, res) => {
  const newMessage = new Message(req.body);
  newMessage.save((err, newMessage) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      console.log("saved:", newMessage);
      socketIo.emit("message", newMessage);
      res.sendStatus(200);
    }
  });
});

app.delete("/messages", (req, res) => {
  Message.deleteMany({}, (err) => {
    if (err) {
      console.log(err), res.sendStatus(500);
    }
    socketIo.emit("message", {});
  });
});

mongoose.connect(
  process.env.MONGO_URI ||
    "mongodb+srv://adam:chatapp123@cluster0-gun9k.mongodb.net/test?retryWrites=true&w=majority",
  { useUnifiedTopology: true },
  (err) => {
    console.log("MongoDB connected. Errors: ", err);
  }
);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("../build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
  });
}

ioServer.listen(PORT, () => console.log("ioServer listening on port ", PORT));
