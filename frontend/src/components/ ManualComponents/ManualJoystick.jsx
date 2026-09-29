import React, { useState, useEffect, useRef } from "react";
import ROSLIB from "roslib";
import "../../styles/joystick.css";
import joystickBaseImg from "../../images/joy-base.png";
import "../../styles/ManualJoystick.css";
import config from "../../scripts/config";

const webSocketPort = config.WEBSOCKET_PORT;
const ip = config.IP;
const port = config.PORT;

const ManualJoystick = ({ isMenuOpen }) => {
  const [handlePosition, setHandlePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const ros = useRef(null);
  const cmdVel = useRef(null);
  const moveInterval = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    ros.current = new ROSLIB.Ros({
      url: `ws://${ip}:${webSocketPort}`,
    });

    ros.current.on("connection", () => {
      console.log("Connected to ROS");
    });
    ros.current.on("error", (error) => {
      console.error("Error connecting to ROS:", error);
    });
    ros.current.on("close", () => {
      console.log("Disconnected from ROS");
    });

    cmdVel.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/robot/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    return () => {
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
      }
      if (ros.current) {
        ros.current.close();
      }
    };
  }, []);

  const sendMoveCommand = (linearX, angularZ) => {
    const twist = new ROSLIB.Message({
      linear: { x: linearX, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angularZ },
    });
    cmdVel.current.publish(twist);
  };

  const startMove = (linearX, angularZ) => {
    sendMoveCommand(linearX, angularZ);
    moveInterval.current = setInterval(() => {
      sendMoveCommand(linearX, angularZ);
    }, 100);
  };

  const stopMove = () => {
    clearInterval(moveInterval.current);
    sendMoveCommand(0, 0);
  };

  const handleTouchStart = (linearX, angularZ) => {
    startMove(linearX, angularZ);
  };

  const handleTouchEnd = () => {
    stopMove();
  };

  return (
    <div
      ref={containerRef}
      className="joystick-container"
      style={{ marginLeft: "125px" }}
    >
      <button
        onMouseDown={() => startMove(0.3, 0)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => handleTouchStart(0.3, 0)}
        onTouchEnd={handleTouchEnd}
        className="triangle north"
      ></button>

      <button
        onMouseDown={() => startMove(0, 0.5)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => handleTouchStart(0, -0.5)}
        onTouchEnd={handleTouchEnd}
        className="triangle east"
        // style={{ marginRight: "40px" }}
      ></button>
      <button
        onMouseDown={() => startMove(-0.3, 0)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => handleTouchStart(-0.3, 0)}
        onTouchEnd={handleTouchEnd}
        className="triangle south"
      ></button>
      <button
        onMouseDown={() => startMove(0, -0.5)}
        onMouseUp={stopMove}
        onMouseLeave={stopMove}
        onTouchStart={() => handleTouchStart(0, 0.5)}
        onTouchEnd={handleTouchEnd}
        className="triangle west"
      >
        {" "}
      </button>
    </div>
  );
};

export default ManualJoystick;
