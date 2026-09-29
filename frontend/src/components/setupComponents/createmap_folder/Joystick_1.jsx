import React, { useState, useRef, useEffect } from "react";
import "../../../styles/createMap_joystick.css";
import ROSLIB from "roslib";
import config from "../../../scripts/config";

const webSocketPort = config.WEBSOCKET_PORT;
const ip = config.IP;

const Joystick = () => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const trailRef = useRef(null);
  const cmdVelTopic = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const centerX = joystickRef.current?.offsetWidth / 2 || 0;
  const centerY = joystickRef.current?.offsetHeight / 2 || 0;
  const maxDistance = centerX - (knobRef.current?.offsetWidth / 2 || 0);

  useEffect(() => {
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

    cmdVelTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: "/robot/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });
  }, []);

  const startDrag = (e) => {
    setIsDragging(true);
  };

  const endDrag = () => {
    setIsDragging(false);
    resetKnob();
    sendStopMessage();
    releaseTrail();
  };

  const drag = (e) => {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = joystickRef.current.getBoundingClientRect();
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;
    const distance = Math.min(maxDistance, Math.sqrt(x * x + y * y));

    const angle = Math.atan2(y, x);
    setCurrentX(Math.cos(angle) * distance);
    setCurrentY(Math.sin(angle) * distance);

    sendVelocityMessage(Math.cos(angle) * distance, Math.sin(angle) * distance);
  };

  const updateTrail = () => {
    if (trailRef.current) {
      trailRef.current.style.background = `radial-gradient(circle at ${
        50 + (currentX / centerX) * 50
      }% ${
        50 + (currentY / centerY) * 50
      }%, rgba(0, 0, 255, 0.6), transparent 80%)`;
    }
  };

  const releaseTrail = () => {
    if (trailRef.current) {
      trailRef.current.style.background = "none";
    }
  };

  const resetKnob = () => {
    setCurrentX(0);
    setCurrentY(0);
  };

  const sendVelocityMessage = (x, y) => {
    if (cmdVelTopic.current) {
      const velocity = new ROSLIB.Message({
        linear: { x: -y, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: x },
      });
      cmdVelTopic.current.publish(velocity);
    }
  };

  const sendStopMessage = () => {
    if (cmdVelTopic.current) {
      const stopVelocity = new ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      });

      cmdVelTopic.current.publish(stopVelocity);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
    } else {
      updateTrail();
    }

    return () => {
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
    };
  }, [isDragging, currentX, currentY]);

  useEffect(() => {
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
    document.addEventListener("touchcancel", endDrag);

    return () => {
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchend", endDrag);
      document.removeEventListener("touchcancel", endDrag);
    };
  }, []);

  useEffect(() => {
    updateTrail();
  }, [currentX, currentY]);

  return (
    <div className="joystick-container1">
      <div className="joystick-box">
        <div
          className="joystick"
          ref={joystickRef}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="joystick-trail" ref={trailRef}></div>
          <div
            className="joystick-knob"
            ref={knobRef}
            style={{
              transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Joystick;
