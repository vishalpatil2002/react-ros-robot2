import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter } from "react-icons/fa";
import "../../styles/Battery.css";
import config from "../../scripts/config.js";

const ip = config.IP;
const webSocketPort = config.WEBSOCKET_PORT;

const BatteryManagement = () => {
  const [batteryData, setBatteryData] = useState({
    charge: 0,
    voltage: 0,
    health: "",
  });

  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const ros = new ROSLIB.Ros({
        url: `ws://${ip}:${webSocketPort}`,
      });

      ros.on("connection", () => {
        setError(false);
      });

      ros.on("error", () => {
        setError(true);
        setBatteryData({
          charge: 0,
          voltage: 0,
          health: "",
        });
      });

      const batteryDataTopic = new ROSLIB.Topic({
        ros: ros,
        name: "/bms",
        messageType: "hw_t/bms",
      });

      batteryDataTopic.subscribe((message) => {
        setBatteryData({
          charge: message.soc,
          voltage: message.cumulative_voltage,
          health: message.health, // "OK"
        });
      });

      return () => {
        ros.close();
      };
    } catch (err) {
      setError(true);
    }
  }, []);

  const renderBatteryIcon = () => {
    const { charge } = batteryData;

    if (charge <= 20) {
      return <FaBatteryQuarter size={50} color="red" />;
    } else if (charge < 80) {
      return <FaBatteryHalf size={50} color="orange" />;
    } else {
      return <FaBatteryFull size={50} color="green" />;
    }
  };

  const healthColor = (health) => {
    switch (health) {
      case "OK":
        return "green";
      case "WARNING":
        return "orange";
      case "BAD":
        return "red";
      default:
        return "black";
    }
  };

  return (
    <Card
      className="card-container"
      style={{
        padding: "20px",
        width: "620px",
        height: "480px",
        marginTop: "15px",
        border: "1px solid #d4b4a2",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid black",
          textAlign: "center",
          fontSize: "25px",
          marginBottom: "10px",
        }}
      >
        Battery Management System
      </div>

      {/* Battery Health (STRING ONLY) */}
      <div className="battery-health" style={{ textAlign: "center", marginTop: "15px" }}>
        <h5>
          Battery Health:
          <span
            style={{
              marginLeft: "8px",
              fontWeight: "bold",
              color: healthColor(batteryData.health),
            }}
          >
            {batteryData.health || "--"}
          </span>
        </h5>
      </div>

      {/* Battery Charge */}
      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <div>
          Battery Charge: {batteryData.charge} % <br />
          {renderBatteryIcon()}
        </div>
      </div>

      {/* Voltage */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        Battery Voltage: {batteryData.voltage} V
      </div>
    </Card>
  );
};

export default BatteryManagement;
