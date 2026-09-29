import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import config from "../../scripts/config";

const ip = config.IP;
const webSocketPort = config.WEBSOCKET_PORT;

function Diagnostics() {
  const [diagnosticsData, setDiagnosticsData] = useState({
    motor_health: "Waiting for data...",
    lidar_status: "Waiting for data...",
    camera_status: "Waiting for data...",
    imu_status: "Waiting for data...",
  });
  const [error, setError] = useState(false);

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
        console.log("message from the topic",newMessage)

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
      <h2>Diagnostics</h2>
      {error ? (
        <p>Connection error. Unable to fetch data.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Name</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Motor Health</td>
              <td>{diagnosticsData.motor_health}</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Lidar Status</td>
              <td>{diagnosticsData.lidar_status}</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Camera Status</td>
              <td>{diagnosticsData.camera_status}</td>
            </tr>
            <tr>
              <td>4</td>
              <td>IMU Status</td>
              <td>{diagnosticsData.imu_status}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Diagnostics;
