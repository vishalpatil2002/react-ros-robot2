const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const ROSLIB = require("roslib");
import config from "./config.js";
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

const ip = config.IP;
const ws = config.WEBSOCKET_PORT;

// ROS connection setup
const ros = new ROSLIB.Ros({
  url: `ws://${ip}:${ws}/`,
});

ros.on("connection", () => {
  console.log("Connected to ROS");
});

ros.on("error", (error) => {
  console.error("Error connecting to ROS:", error);
});

ros.on("close", () => {
  console.log("Disconnected from ROS");
});

// Subscribe to command velocity topic
const cmdVelSubscriber = new ROSLIB.Topic({
  ros: ros,
  name: "/cmd_vel",
  messageType: "geometry_msgs/Twist",
});

function sendStopMessage() {
  console.log("Sending stop message");
  const stopMessage = new ROSLIB.Message({
    linear: {
      x: 0,
      y: 0,
      z: 0,
    },
    angular: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
  try {
    cmdVelSubscriber.publish(stopMessage);
    console.log("Stop message sent successfully");
  } catch (error) {
    console.error("Error sending stop message:", error);
  }
}

// Socket communication to handle pausing events from the client
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("pauseMission", () => {
    console.log("Pause mission button pressed");
    sendStopMessage();
    socket.emit("pauseMissionFeedback", {
      message: "Mission paused successfully",
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

// Start listening
const port = 3001;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
