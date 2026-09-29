import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import config from "../../scripts/config";
import axios from "axios";

const ip = config.IP;
const webSocketPort = config.WEBSOCKET_PORT;
const port = config.PORT;

function Diagnostics() {
  const [diagnosticsData, setDiagnosticsData] = useState({
    motor_health: "Waiting for data...",
    lidar_status: "Waiting for data...",
    camera_status: "Waiting for data...",
    imu_status: "Waiting for data...",
  });
  const [error, setError] = useState(false);
  const [frontlidar, setFront_lidar] = useState(null);
  const [backlidar, setBack_lidar] = useState(null);
  const [leftwheel, setLeft_wheel] = useState(null);
  const [rightwheel, setRight_wheel] = useState(null);
  const [plcStatus, setPlcStatus] = useState("UNKNOWN");
  const [plcError, setPlcError] = useState(null);
  
  useEffect(() => {
    const fetchCoil = async () => {
      try {
        const response = await axios.post(`http://${ip}:${port}/api/diagnostics`);
        console.log("coils", response.data.coil_values);

        setPlcStatus(response.data.plc_status);
        setPlcError(response.data.plc_error);
    
        setFront_lidar(response.data.coil_values.front_lidar)
        setBack_lidar(response.data.coil_values.back_lidar)
        setLeft_wheel(response.data.coil_values.left_wheel)
        setRight_wheel(response.data.coil_values.right_wheel)
      } catch (error) {
        console.error("error fetching coild data");
        setPlcStatus("DISCONNECTED");
        setPlcError("Backend not reachable");
    
      }
    }
    fetchCoil();
  }, []);

  const getStatus = (value) => {
    if (plcStatus !== "CONNECTED") {
      return "NO DATA";
    }
  
    if (value === null) return "Waiting...";
    return value === 1 ? "OK" : "NOT OK";
  };

  const getColor = (value) => {
    if (plcStatus !== "CONNECTED") {
      return "black";
    }
   
    if (value === null) return "black";
    return value === 1 ? "green" : "red";
  };
  

  useEffect(() => {
    let ros;
    const alarmAudio = new Audio('./alarm.mp3')
    try {
      ros = new ROSLIB.Ros({
        url: `ws://${ip}:${webSocketPort}`,
      });

      ros.on("connection", () => {
        setError(false);
      });

      ros.on("error", () => {
        setError(true);
        setDiagnosticsData((prevData) => ({
          motor_health: "No data",
          lidar_status: "No data",
          camera_status: "No data",
          imu_status: "No data",
        }));
      });

      const updateMessage = (topic, message) => {

        const newMessage = message.data || "No data";
        console.log("message from the topic", newMessage)

        setDiagnosticsData((prevData) => ({
          ...prevData,
          [topic]: message.data || "No data",
        }));

        if (newMessage.toLowerCase().includes("Failed")) {
          // console.log("inside the audio play")
          // alarmAudio.play();
          alert(newMessage);
        }
      };

      const motorHealthTopic = new ROSLIB.Topic({
        ros,
        name: "/motor_health",
        messageType: "std_msgs/String",
      });
      motorHealthTopic.subscribe((message) =>
        updateMessage("motor_health", message)
      );

      const lidarStatusTopic = new ROSLIB.Topic({
        ros,
        name: "/lidar_status",
        messageType: "std_msgs/String",
      });
      lidarStatusTopic.subscribe((message) =>
        updateMessage("lidar_status", message)
      );

      const cameraStatusTopic = new ROSLIB.Topic({
        ros,
        name: "/camera_status",
        messageType: "std_msgs/String",
      });
      cameraStatusTopic.subscribe((message) =>
        updateMessage("camera_status", message)
      );

      const imuStatusTopic = new ROSLIB.Topic({
        ros,
        name: "/imu_status",
        messageType: "std_msgs/String",
      });
      imuStatusTopic.subscribe((message) =>
        updateMessage("imu_status", message)
      );

      // Manual test for Alarm
      // const newMessage = "No data";
      // console.log("message from the topic",newMessage)


      // if (newMessage === "No data") {
      //   console.log("inside the audio play")
      //   alarmAudio.play();
      // }


      return () => {
        motorHealthTopic.unsubscribe();
        lidarStatusTopic.unsubscribe();
        cameraStatusTopic.unsubscribe();
        imuStatusTopic.unsubscribe();
        if (ros) {
          ros.close();
        }
      };
    } catch (error) {
      setError(true);
      setDiagnosticsData({
        motor_health: "No data",
        lidar_status: "No data",
        camera_status: "No data",
        imu_status: "No data",
      });
    }
  }, []);

  return (
    <div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h2>Diagnostics</h2>

  <div style={{ textAlign: "right" }}>
    <strong>PLC:</strong>{" "}
    <span
      style={{
        color:
          plcStatus === "CONNECTED"
            ? "green"
            : plcStatus === "ERROR"
            ? "orange"
            : "red",
        fontWeight: "bold"
      }}
    >
      {plcStatus}
    </span>

    {plcError && (
      <div style={{ color: "red", fontSize: "12px" }}>
        {plcError}
      </div>
    )}
  </div>
</div>
      {error ? (
        <p>Connection error. Unable to fetch data.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th style={{textAlign:"center"}}>Sl No</th>
              <th style={{textAlign:"center"}}>Name</th>
              <th style={{textAlign:"center"}}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Motor Health</td>
              <td>{diagnosticsData.motor_health}</td>
            </tr>
            {/* <tr>
              <td>2</td>
              <td>Lidar Status</td>
              <td>{diagnosticsData.lidar_status}</td>
            </tr> */}
            <tr>
              <td>2</td>
              <td>Camera Status</td>
              <td>{diagnosticsData.camera_status}</td>
            </tr>
            <tr>
              <td>3</td>
              <td>IMU Status</td>
              <td>{diagnosticsData.imu_status}</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Front Lidar</td>
              <td style={{ color: getColor(frontlidar) }}>
                {getStatus(frontlidar)}
              </td>
            </tr>
            <tr>
              <td>5</td>
              <td>Back Lidar</td>
              <td style={{ color: getColor(backlidar) }}>
                {getStatus(backlidar)}
              </td>
            </tr>
            <tr>
              <td>6</td>
              <td>Left Wheel</td>
              <td style={{ color: getColor(leftwheel) }}>
                {getStatus(leftwheel)}
              </td>
            </tr>
            <tr>
              <td>7</td>
              <td>Right Wheel</td>
              <td style={{ color: getColor(rightwheel) }}>
                {getStatus(rightwheel)}
              </td>
            </tr>

          </tbody>
        </table>
      )}
    </div>
  );
}

export default Diagnostics;