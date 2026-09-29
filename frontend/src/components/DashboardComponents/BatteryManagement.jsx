// import "../../styles/App.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { Card, ProgressBar } from "react-bootstrap";
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter } from "react-icons/fa";
import {
  FaThermometerFull,
  FaThermometerHalf,
  FaThermometerQuarter,
  FaThermometerEmpty,
} from "react-icons/fa";
import "../../styles/Battery.css";
import  config from "../../scripts/config.js";

const ip = config.IP;
const webSocketPort = config.WEBSOCKET_PORT;


const BatteryManagement = () => {
    const [batteryHealth, setBatteryHealth] = useState(90);
  // const [batteryCapacity, setBatteryCapacity] = useState(75);
  const [batteryData, setbatteryData] = useState({
    batteryTemperature: 0,
    charge: 0,
    current: 0,
    voltage: 0,
    status:null,
  });

  const [error, setError] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      // setBatteryCapacity((prev) => (prev < 100 ? prev + 1 : 100));
      // setBatteryTemperature((prev) => (prev < 40 ? prev + 0.2 : 35));
    }, 3000);

    try {
    const  ros = new ROSLIB.Ros({
        url: `ws://${ip}:${webSocketPort}`,
      });

      ros.on("connection", () => {
        setError(false);
      });

      ros.on("error", () => {
        setError(true);
        setbatteryData({
          current: 0,
          voltage: 0,
          chargingTimeLeft: 0,
          batteryTemperature: 0,
        });
      });

      const batteryDataTopic = new ROSLIB.Topic({
        ros : ros,
        name : "/taurus_status",
        messageType : "hw_t/taurus_bms",
      }) 
      
      batteryDataTopic.subscribe((message) => {
        setbatteryData({
          charge : message.soc,
          voltage : message.cumulative_voltage,
          current : message.current,
          status : message.charger_status == 1 ? "charging" : message.charge_status == 2 ? "discharging" : "rest",
          batteryTemperature : 0
        })
      } )

      


      return () => {
        if (ros) {
          ros.close();
        }
      };
    } catch (error) {
      setError(true);
      setbatteryData({
        current: 0,
        voltage: 0,
        charge: 0,
        batteryTemperature: 0,
      });
    }
    return () => clearInterval(interval);
  }, []);

  const renderBatteryIcon = () => {
    const { charge } = batteryData;
    let color;
    if (charge <= 20) {
      color = "red";
      return <FaBatteryQuarter size={50} color={color} />;
    } else if (charge > 20 && charge < 80) {
      color = "orange";
      return <FaBatteryHalf size={50} color={color} />;
    } else if (charge >= 80 && charge < 90) {
      color = "yellow";
      return <FaBatteryHalf size={50} color={color} />;
    } else {
      color = "green";
      return <FaBatteryFull size={50} color={color} />;
    }
  };

  const renderThermometerIcon = () => {
    const { batteryTemperature } = batteryData;
    let color;
    if (batteryTemperature <= 20) {
      color = "blue";
      return <FaThermometerQuarter size={50} color={color} />;
    } else if (batteryTemperature > 20 && batteryTemperature <= 30) {
      color = "lightblue";
      return <FaThermometerHalf size={50} color={color} />;
    } else if (batteryTemperature > 30 && batteryTemperature <= 38) {
      color = "orange";
      return <FaThermometerFull size={50} color={color} />;
    } else {
      color = "red";
      return <FaThermometerFull size={50} color={color} />;
    }
  };

  return (
    <Card
      className="card-container"
      style={{ padding: "20px",width:"620px",boxShadow: "0 0 10px rgba(0,0,0,0.1)",height:"480px", border:"1px solid #d4b4a2", marginTop:"15px"
      }}
    >
           <div
        style={{
          borderBottom: "1px solid black",
          textAlign: "center",
          color: "black",
          fontSize: "25px",
          marginBottom: "10px",
        }}
      >
     Battery Management System
      </div>

      <div className="battery-status">
        <h5>Status: {batteryData.status}</h5>
      </div>

      <div className="battery-health">
        <h5>Battery Health: {batteryHealth}%</h5>
        <ProgressBar
          variant="success"
          now={batteryHealth}
          label={`${batteryHealth}%`}
        />
      </div>

      <div
        className="battery-capacity"
        style={{ marginTop: "10px", textAlign: "center", display:"flex", justifyContent:"space-evenly"}}
      >
        <div>Battery Charge: {batteryData.charge} % {renderBatteryIcon()}
        </div>
        <div>Temperature:{batteryData.batteryTemperature} °C {renderThermometerIcon()}
        </div>
        {/* <ProgressBar now={batteryCapacity} label={`${batteryCapacity}%`} /> */}
      </div>
      {/*<div
        className="battery-temperature"
        style={{ marginTop: "20px", textAlign: "center" }}
      >

         {batteryTemperature > 38 ? (
          <ProgressBar
            variant="danger"
            now={batteryTemperature}
            max={50}
            label={`${batteryTemperature.toFixed(1)}°C`}
          />
        ) : (
          <ProgressBar
            variant="info"
            now={batteryTemperature}
            max={50}
            label={`${batteryTemperature.toFixed(1)}°C`}
          />
        )} 
      </div> */}

      <div className="charging-time" style={{ marginTop: "10px", textAlign:"center" }}>
        <div>
          Time Left to Fully Charge: {batteryData.chargingTimeLeft} minutes
        </div>
      </div>
      <div className="voltage" style={{ marginTop: "5px", textAlign:"center"  }}>
        <div>Battery Voltage: {batteryData.voltage} volt</div>
      </div>
      <div className="current" style={{ marginTop: "5px",textAlign:"center"  }}>
        <div>Battery Current: {batteryData.current} ampere</div>
      </div>
    </Card>
  );
};

export default BatteryManagement;
