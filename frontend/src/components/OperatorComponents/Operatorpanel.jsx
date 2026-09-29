import { useEffect, useState } from "react";
import "../../styles/Operatorpanel.css";
import config from "../../scripts/config.js";
import Crypt from "../../scripts/cryption";
import ROSLIB from "roslib";
import io from "socket.io-client";

const ip = config.IP;
const port = config.PORT;
const webSocketPort = config.WEBSOCKET_PORT;
const socket = io(`http://${ip}:${port}`);


const TodaysTasks = () => {
  const [tasksByDate, setTasksByDate] = useState({});
  const [date, setDate] = useState("");
  const [selectedMission, setSelectedMission] = useState(null);
  const [isHardwareFaulty, setIsHardwareFaulty] = useState({
    motor: { isFaulty: false },
    lidar: { isFaulty: false },
    // imu: { isFaulty: false },
    camera: { isFaulty: false },
  });
  const [ros, setRos] = useState(null);
  const [error, setError] = useState(null);
  const [activationStatus, setActivationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [rosMessagesReceived, setRosMessagesReceived] = useState({
    motor: false,
    lidar: false,
    // imu: false,
    camera: false,
  });

  socket.on("missionStatus", (value) => {
    if (value === "activated") {
      setActivationStatus("Mission activated successfully!");
    }
    if(value == "completed"){
      setActivationStatus('completed')
    }
  })
  // Fetch today's tasks on component mount
  useEffect(() => {
    const fetchTodaysTasks = async () => {
      try {
        // const loggedInUser = Crypt.decrypt(localStorage.getItem("UserName"));
        // if (loggedInUser) {
          const response = await fetch(
            `http://${ip}:${port}/api/todaysTasks`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          console.log("data", data);
          const groupedTasks = data.reduce((acc, task) => {
            if (!acc[task.date]) {
              acc[task.date] = [];
            }
            acc[task.date] = acc[task.date].concat(task.missionQueue);
            return acc;
          }, {});

          setTasksByDate(groupedTasks);

          if (data.length > 0) {
            setDate(data[0].date);
          }
        // } else {
        //   console.log("Login to see the tasks");
        // }
      } catch (error) {
        console.error("Error fetching today's tasks:", error);
        setError("Failed to fetch tasks. Please try again later.");
      }
    };
    fetchTodaysTasks();
  }, []);

  // Close ROS connection on component unmount
  // useEffect(() => {
  //   return () => {
  //     if (ros) {
  //       ros.close();
  //     }
  //   };
  // }, [ros]);

  // Update hardware status
  const updateHealthStatus = (hardwarePart, isFaulty) => {
    setIsHardwareFaulty((prev) => ({
      ...prev,
      [hardwarePart]: { isFaulty },
    }));
  };

  // Perform hardware health check
  const healthCheck = async () => {
    setIsLoading(true); // Start loading
    setRosMessagesReceived({
      motor: false,
      lidar: false,
      // imu: false,
      camera: false,
    });

    const connectToRos = new ROSLIB.Ros({
      url: `ws://${ip}:${webSocketPort}`,
    });

    connectToRos.on("connection", () =>
      console.log("Connected to ROS successfully")
    );
    connectToRos.on("error", (error) => {
      console.error("Error connecting to ROS:", error);
      setError("Failed to connect to ROS. Please check the connection.");
      setIsLoading(false); // Stop loading on error
    });

    const motor = new ROSLIB.Topic({
      ros: connectToRos,
      name: "/motor_health",
      messageType: "std_msgs/String",
    });

    const lidar = new ROSLIB.Topic({
      ros: connectToRos,
      name: "/lidar_status1",
      messageType: "std_msgs/String",
    });

    const camera = new ROSLIB.Topic({
      ros: connectToRos,
      name: "/camera_status1",
      messageType: "std_msgs/String",
    });

    // const imu = new ROSLIB.Topic({
    //   ros: connectToRos,
    //   name: "/imu_status",
    //   messageType: "std_msgs/String",
    // });

    motor.subscribe((mes) => {
      console.log("message", mes)
      updateHealthStatus("motor", mes.data !== "----motor is healthy----");
      setRosMessagesReceived((prev) => ({ ...prev, motor: true }));
    });

    lidar.subscribe((mes) => {
      updateHealthStatus("lidar", mes.data !== "lidar is healthy");
      setRosMessagesReceived((prev) => ({ ...prev, lidar: true }));
    });

    camera.subscribe((mes) => {
      updateHealthStatus("camera", mes.data !== "camera is healthy");
      setRosMessagesReceived((prev) => ({ ...prev, camera: true }));
    });

    // imu.subscribe((mes) => {
    //   if (mes.data !== "imu is healthy") updateHealthStatus("imu", true);
    // });

    const updateHealthStatus = (hardwarePart, bool) => {
      console.log("hardware", hardwarePart, bool)
      setIsHardwareFaulty((prev) => ({
        ...prev,
        [hardwarePart]: { isFaulty: bool },
      }));
    };

    // console.log(isHardwareFaulty, "this is the Object");

    // const isFaulty = Object.values(isHardwareFaulty).some(
    //   (item) => item.isFaulty
    // );

    // console.log(isFaulty);
    // if (isFaulty) {
    //   console.log(isFaulty, "isFaulty");
    //   alert(
    //     "There is some issue please check in the alarms section and fix it before starting a mission"
    //   );
    //   return;
    // }
    // updateHealthStatus("imu", mes.data !== "imu is healthy");
    // setRosMessagesReceived((prev) => ({ ...prev, imu: true }));

    setRos(connectToRos);
  };

  
  // Activate the selected mission
  const activateMission = async () => {
    if (!selectedMission) {
      alert("Choose a mission");
      return;
    }
    // const missionParam = new ROSLIB.Param({
    //   ros: ros,
    //   name: "pauseplay"
    // });
    
    // let isActive = missionParam.get();
   
    let isActive = localStorage.getItem("missionStatus")
    console.log("isActive", isActive);
    if(isActive !== 'Completed'){
      alert("Mission Already Running");
      return
    } 
    await healthCheck();
    console.log("inside activate task");

    try {
      await healthCheck();

      // Wait for ROS messages to be received or timeout after 5 seconds
      // await new Promise((resolve, reject) => {
      //   const interval = setInterval(() => {
      //     if (
      //       Object.values(rosMessagesReceived).every((received) => received)
      //     ) {
      //       console.log('recieved all the objcts data')
      //       clearInterval(interval);
      //       resolve();
      //     }
      //   }, 100);

      //   // Timeout after 5 seconds
      //   setTimeout(() => {
      //     clearInterval(interval);
      //     reject(new Error("Timeout waiting for ROS messages"));
      //   }, 5000);
      // });

      const isFaulty = Object.values(isHardwareFaulty).some(
        (device) => device.isFaulty
      );
      console.log(isFaulty, 'printing fault message if any');
      if (isFaulty) {
        console.log(isFaulty, "isFaulty");
        alert(
          "There is some issue. Please check the alarms section and fix it before starting a mission."
        );
        setIsLoading(false); // Stop loading
        return;
      }

      const { id: missionId, inputValue, missionName } = selectedMission;

      localStorage.setItem("activeMissionId", missionId);
      const response = await fetch(`/api/activeMission`, {
        method: "POST",
        body: JSON.stringify({ missionId, missionName, inputValue }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSelectedMission(null);
        setActivationStatus("Mission activated successfully!");
      } else {
        setActivationStatus("Error activating mission. Please try again.");
        console.error("Error activating mission:", response.statusText);
      }
    } catch (error) {
      console.error("Error during mission activation:", error);
      setActivationStatus("Error activating mission. Please try again.");
      // alert("Failed to check hardware status. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle task click
  const handleTaskClick = (mission) => {
    setSelectedMission({
      id: mission.id,
      inputValue: mission.inputValue,
      missionName: mission.missionName,
    });
  };

  return (
    <div id="main">
      <h1 style={{ textAlign: "center" }}>Today's Tasks</h1>
      <h5 style={{ textAlign: "center" }}>Date : {date}</h5>
      <div>
        <button
          id="activateMission"
          className="activate-button"
          onClick={activateMission}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? "Loading..." : "Activate Task"}
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {activationStatus && (
        <p style={{ textAlign: "center" }}>{activationStatus}</p>
      )}

      {Object.keys(tasksByDate).length > 0 ? (
        Object.keys(tasksByDate).map((taskDate, index) => (
          <div id="tasks" key={index}>
            {tasksByDate[taskDate].map((mission, idx) => (
              <div key={idx} className="mission-item">
                <button
                  className="task-button"
                  onClick={() => handleTaskClick(mission)}
                  disabled={isLoading} // Disable task buttons while loading
                >
                  {mission.missionName}
                </button>

                <label style={{ marginLeft: "20px" }}>
                  {mission.inputValue}
                </label>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No tasks for today.</p>
      )}
    </div>
  );
};

export default TodaysTasks;

// Adding a comment for visibility sunday_16 branch
