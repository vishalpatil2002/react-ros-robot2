import React, { useState, useEffect } from "react";
import ROSLIB from "roslib";
import "../../../styles/joystick.css";
import joystickBaseImg from "../../../images/joy-base.png";
import config from "../../../scripts/config";

const webSocketPort = config.WEBSOCKET_PORT;
const ip = config.IP;

const Joystick = () => {
  const [handlePosition, setHandlePosition] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const handle = container.querySelector(".joystick-handle");

    let handleX = 0;
    let handleY = 0;

    const maxDistance = (container.offsetWidth - handle.offsetWidth) / 2;

    const ros = new ROSLIB.Ros({
      url: `ws://${ip}:${webSocketPort}`,
    });

    ros.on("connection", () => {
      console.log("Connected to ROS!");
    });

    ros.on("error", (error) => {
      console.error("Error connecting to ROS:", error);
    });

    ros.on("close", () => {
      console.log("Disconnected from ROS");
    });

    const cmdVel = new ROSLIB.Topic({
      ros: ros,
      name: "/robot/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    let twistTimer;

    const startTwistTimer = () => {
      twistTimer = setInterval(updateTwistAndPublish, 100);
    };

    const stopTwistTimer = () => {
      clearInterval(twistTimer);
    };

    const updateHandlePosition = (x, y) => {
      const newX = Math.max(-maxDistance, Math.min(x, maxDistance));
      const newY = Math.max(-maxDistance, Math.min(y, maxDistance));

      handle.style.transform = `translate(${newX}px, ${newY}px)`;

      handleX = newX;
      handleY = newY;

      updateTwistAndPublish();
    };

    const updateTwistAndPublish = () => {
      const linearVelocity = handleY / (maxDistance * 4);
      const angularVelocity = -handleX / (maxDistance * 4);

      const twist = new ROSLIB.Message({
        linear: {
          x: -linearVelocity,
          y: 0,
          z: 0,
        },
        angular: {
          x: 0,
          y: 0,
          z: angularVelocity,
        },
      });

      cmdVel.publish(twist);
    };

    const handleInput = (event) => {
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const containerCenterY = containerRect.top + containerRect.height / 2;

      let inputX, inputY;
      if (event.type === "mousedown" || event.type === "mousemove") {
        inputX = event.clientX;
        inputY = event.clientY;
      } else if (event.type === "touchstart" || event.type === "touchmove") {
        inputX = event.touches[0].clientX;
        inputY = event.touches[0].clientY;
      }

      const distanceX = inputX - containerCenterX;
      const distanceY = inputY - containerCenterY;

      updateHandlePosition(distanceX, distanceY);
    };

    const preventDefault = (e) => {
      e.preventDefault();
    };

    handle.addEventListener("mousedown", () => {
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      window.addEventListener("mousemove", handleInput);
      startTwistTimer();
    });

    window.addEventListener("mouseup", () => {
      document.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("mousemove", handleInput);
      updateHandlePosition(0, 0);
      stopTwistTimer();
    });

    handle.addEventListener("touchstart", () => {
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      window.addEventListener("touchmove", handleInput);
      startTwistTimer();
    });

    window.addEventListener("touchend", () => {
      document.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("touchmove", handleInput);
      updateHandlePosition(0, 0);
      stopTwistTimer();
    });

    updateHandlePosition(0, 0);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("mousemove", handleInput);
      window.removeEventListener("touchmove", handleInput);
      window.removeEventListener("mouseup", stopTwistTimer);
      window.removeEventListener("touchend", stopTwistTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="joystick-container"
      // style={{ marginLeft: "125px" }}
    >
      <img
        src={joystickBaseImg}
        alt="Joystick Base"
        draggable="false"
        style={{ width: "250px", height: "200px" }}
      />

      <div
        className="joystick-handle"
        style={{
          transform: `translate(${handlePosition.x}px, ${handlePosition.y}px)`,
          width: "70px",
          height: "70px",
        }}
      >
        <span className="shadow"></span>
      </div>
    </div>
  );
};

export default Joystick;
