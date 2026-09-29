// src/components/ConnectionToRobot.js
import React from "react";

const ConnectionToRobot = () => {
  return (
    <div
      className="connection-to-robot-box"
      style={{
        backgroundColor: "white",
        color: "black",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid black",
          textAlign: "center",
          fontSize: "25px",
        }}
      >
        Connection to Robot
      </div>
      <div className="status">
        Connection Status: <span>Disconnected</span>
      </div>
      <div className="lidar-status">
        <label>
          <input type="checkbox" /> Front Lidar
        </label>
        <label>
          <input type="checkbox" /> Rear Lidar
        </label>
      </div>
      <div className="imu-status">
        IMU Status: <input type="checkbox" />
      </div>
      <div className="lidar-status">
        <label>
          <input type="checkbox" /> Left Motor
        </label>
        <label>
          <input type="checkbox" /> Right Motor
        </label>
      </div>
    </div>
  );
};

export default ConnectionToRobot;
