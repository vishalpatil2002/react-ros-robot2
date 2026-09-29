import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import "../styles/mainstyle.css";
import "../styles/profile.css";
import ham from "../images/ham.png";
import logo from "../images/logo.png";
import play from "../images/play1.png";
import pause from "../images/pause5.png";
import emergency from "../images/abort.png";
import arrow from "../images/arrow.png";
import user from "../images/UserProfile.png";
import register from "../images/register.png";
import logout from "../images/logout1.png";
import setting from "../images/setting.png";
import ROSLIB from "roslib";
import io from "socket.io-client";
import { MissionContext } from "../context/MissionContext";
import config from "../scripts/config.js";
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter } from "react-icons/fa";
import Crypt from "../scripts/cryption";
const ip = config.IP;
const port = config.PORT;
const webSocketPort = config.WEBSOCKET_PORT;

const Header = ({ toggleMenu, toggleLaunchers }) => {
  const [ros, setRos] = useState(null);
  const [missionState, setMissionState] = useState("paused");
  const [pausedBtnText, setPausedBtnText] = useState("-");
  const [batteryPercentage] = useState(null);
  // const pauseBtnRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHoldActive, setIsHoldActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { activeMission, setactive } = useContext(MissionContext);

  const { selectedMap, setSelectedMap } = useContext(MissionContext);
  const [alarmStatus, setAlarmStatus] = useState(null);
  const [alarmCount, setAlarmCount] = useState(() => {
    return parseInt(localStorage.getItem("alarmCount")) || 0;
  });

  const navigate = useNavigate();

  const socket = io(`http://${ip}:${port}`);

  useEffect(() => {
    localStorage.setItem("alarmCount", alarmCount);
  }, [alarmCount]);

  useEffect(() => {
    socket.on("broadcastMapName", (mapName) => {
      setSelectedMap(mapName);
    });

    socket.on("removeMapNameFromAllClients", (mapName) => {
      setSelectedMap(mapName);
    });

    return () => {
      socket.off("broadcastMapName");
      socket.off("removeMapNameFromAllClients");
    };
  }, [selectedMap]);

  const UserId = Crypt.decrypt(localStorage.getItem("id"));
  const handleLogout = async () => {
    try {
      const response = await fetch(`http://${ip}:${port}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UserId }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        localStorage.clear();
        window.location.href = "/login";
        navigate("/login");
      } else {
        console.error("Logout failed:", data.message || data);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  // const userRole = Crypt.decrypt(localStorage.getItem("role"));

  const handleRegister = () => {
    // userRole === "Operator"
    //   ? (window.location.href = "/unauthorized")
    //   : (window.location.href = "/signup");
    navigate("/signup");
  };

  const handleOpenSettings = () => {
    window.location.href = "/settings";
    navigate("/settings");
  };
  const handleAlarmNotifications = () => {
    window.location.href = "/alarm";
    setAlarmCount(0);
  };
  useEffect(() => {
    const storedPausedBtnText = localStorage.getItem("pausedBtnText");
    const storedActiveMission = localStorage.getItem("activeMission");

    if (storedActiveMission) {
      setactive(storedActiveMission);
    }

    if (storedPausedBtnText) {
      setPausedBtnText(storedPausedBtnText);
    }

    if (storedActiveMission === "No active task") {
      setPausedBtnText("_");
    } else if (storedActiveMission === "Aborted") {
      setPausedBtnText("Canceled");
    } else if (!storedPausedBtnText && activeMission === "No active task") {
      setPausedBtnText("_");
    }

    const newRos = new ROSLIB.Ros({
      url: `ws://${ip}:${webSocketPort}`,
    });
    newRos.on("connection", () => {
      console.log("Connected to WebSocket ROS server");
    });

    newRos.on("error", (error) => {
      console.error("Error connecting to WebSocket server:", error);
    });

    newRos.on("close", () => {
      console.log("Connection to WebSocket server closed");
    });
    const chargeTopic = new ROSLIB.Topic({
      ros: newRos,
      name: "/taurus_status",
      messageType: "hw_t/taurus_bms",
    });

    chargeTopic.subscribe((message) => {
      setBatteryPercentage(message.soc.toFixed(2));
    });

    socket.on("missionComplete", handleMissionComplete);
    socket.on("activeMissionUpdate", (missionName) => {
      setactive(missionName);
      if (missionName === "No active task") {
        setPausedBtnText("_");
        localStorage.setItem("pausedBtnText", "_");
      }
      if (missionName === "Aborted") {
        setPausedBtnText("Canceled");
        localStorage.setItem("pausedBtnText", "Canceled");
      } else {
        setPausedBtnText("Playing");
        localStorage.setItem("pausedBtnText", "Playing");
        // if(pauseBtnRef.current){
        //   pauseBtnRef.current.style.backgroundColor = 'green'
        //   pauseBtnRef.current.style.color = 'white';
        // }
      }
      localStorage.setItem("activeMission", missionName);
    });
    socket.on("updatePausedBtnText", (text) => {
      setPausedBtnText(text);
      localStorage.setItem("pausedBtnText", text);
    });
    socket.on("updatecanceledBtnText", (text) => {
      setPausedBtnText(text);
      setactive("Aborted");
      localStorage.setItem("pausedBtnText", text);
      localStorage.setItem("activeMission", "Aborted");
    });

    socket.on("Alarm", (message) => {
//      alert(message.message)
      // setAlarmStatus(message);
      console.log("alarm message", message);
      setAlarmCount((prevCount) => prevCount + 1);
    });

    if (pausedBtnText === "Playing") {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }

    return () => {
      socket.off("missionComplete", handleMissionComplete);
      socket.off("activeMissionUpdate");
      socket.off("updatePausedBtnText");
      socket.off("updatecanceledBtnText");
      chargeTopic.unsubscribe();
    };
    setRos(newRos);
    // Clean up ROS connection on unmount
    // return () => {
    //   newRos.close();
    // };
  }, [pausedBtnText]);

  const handleMissionComplete = () => {
    setactive("No active task");
    setPausedBtnText("_");
    localStorage.setItem("pausedBtnText", "_");
    localStorage.setItem("activeMission", "No active task");
    socket.emit("updatePausedBtnText", "_");

    const missionName = document
      .getElementById("activemissionname")
      .innerText.replace("Task: ", "");
    const status = document.getElementById("pausedbtn").innerText;

    // Adding some logic to emit this only once and not thrice ---- Bug fix -Shoaib
    if (missionName !== "No active task") {
      socket.emit("missionComplete1", { missionName, status });
    }
    // socket.emit("missionComplete1", { missionName, status });
  };

  const changepauseButtonColor = document.getElementById("pausedbtn");

  const playMission = () => {
    socket.emit("playMission");
    setPausedBtnText("Playing");
    // if(pauseBtnRef.current){
    // pauseBtnRef.style.backgroundColor = 'green';
    // pauseBtnRef.style.color = 'white';
    // }
    changepauseButtonColor.style.backgroundColor = "green";
    changepauseButtonColor.style.color = "white";
    localStorage.setItem("pausedBtnText", "Playing");
  };

  const pauseMission = () => {
    socket.emit("pauseMission");
    setPausedBtnText("Paused");
    // if(pauseBtnRef.current){
    // pauseBtnRef.style.backgroundColor = 'orange';
    // pauseBtnRef.style.color = 'white';
    // }
    changepauseButtonColor.style.backgroundColor = "orange";
    changepauseButtonColor.style.color = "white";
    localStorage.setItem("pausedBtnText", "Paused");
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseMission();
      setPausedBtnText("Paused");
      setIsPlaying(false);
    } else {
      playMission();
      setPausedBtnText("Playing");
      setIsPlaying(true);
    }
  };

  const shouldShowPauseButton = pausedBtnText === "Playing";

  const cancelMission = () => {
    const missionName = document
      .getElementById("activemissionname")
      .innerText.replace("Task: ", "");
    socket.emit("cancelMission", { missionName, status: "Aborted" });
    setPausedBtnText("Canceled");
    setactive("Aborted");
    changepauseButtonColor.style.backgroundColor = "red";
    changepauseButtonColor.style.color = "white";
    localStorage.setItem("activeMission", "Aborted");
    localStorage.setItem("pausedBtnText", "Canceled");
  };
  const updateUserName = () => {
    const userName = Crypt.decrypt(localStorage.getItem("UserName"));
    // const role = userRole;
    const email = Crypt.decrypt(localStorage.getItem("Email"));

    const roleSpan = document.getElementById("role");
    const nameSpan = document.getElementById("name");
    const userProfileSpan = document.getElementById("username");
    const emailspan = document.getElementById("email");

    if (userName) {
      nameSpan.textContent = `Hi!,${userName}`;
      userProfileSpan.textContent = userName;
      roleSpan.textContent = `Role : ${role}`;
      emailspan.textContent = email;
    }
  };
  setTimeout(() => updateUserName(), 100);

  const toggleHold = async () => {
    setLoading(true);

    const holdState = isHoldActive ? 0 : 1; // When toggled ON → release (1)
    console.log(`Sending hold state: ${holdState}`);

    try {
        const response = await fetch(`http://${ip}:${port}/connect-to-robot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hold: holdState }),
        });

        const result = await response.json();
        console.log(result.message || result.error);
        setIsHoldActive((prev) => !prev); // Update toggle state
    } catch (error) {
        console.error("Error:", error);
    } finally {
        setLoading(false);
    }
};


  return (
    <div id="navbar" className="header-container">
      <div id="left">
        <img
          src={ham}
          className="icn menuicn"
          id="menuicn"
          alt="menu-icon"
          onClick={toggleMenu}
          style={{ color: "#4a4a4a" }}
        />
        <div id="logo">
          <span>SSAPL</span>
          <span id="name"></span>
        </div>
      </div>
      <div id="right">
        <div id="playpausebuttons">
          <div id="toggleButton">
            <button
              onClick={togglePlayPause}
              style={{ backgroundColor: "#e2d1c3", border: "none" }}
            >
              {shouldShowPauseButton ? (
                <img
                  src={pause}
                  className="icn2 menuicn"
                  alt="pause-icon"
                  style={{ width: "30px", height: "40px" }}
                />
              ) : (
                <img
                  src={play}
                  className="icn2 menuicn"
                  alt="play-icon"
                  style={{ width: "40px", height: "40px" }}
                />
              )}
            </button>
          </div>
          <div id="emgncybutton">
            <img
              src={emergency}
              className="icn3 menuicn"
              id="cancelmission"
              alt="emergency-icon"
              onClick={cancelMission}
              style={{ width: "50px", height: "50px" }}
            />
          </div>
        </div>

        <div id="mission">
          {activeMission ? (
            <p
              id="activemissionname"
              style={{ fontSize: "15px" }}
            >{`Task: ${activeMission}`}</p>
          ) : (
            <p>No active task</p>
          )}
          <button
            id="pausedbtn"
            // ref={pauseBtnRef}
          >
            {pausedBtnText}
          </button>
        </div>
        <div id="setting">
          {/* { <img
            src={arrow}
            className="icn menuicn"
            id="menuicn"
            alt="menu-icon"
            onClick={toggleLaunchers}
          /> } */}
          <div className="dropdown-container">
            <details className="dropdown right">
              <summary className="avatar">
                <img
                  src={user}
                  style={{ width: "40px", border: "1px solid white" }}
                />
                {alarmCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0px",
                      right: "0px",
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {alarmCount}
                  </span>
                )}
              </summary>
              <ul>
                <li>
                  <div
                    id="username"
                    className="bold italic"
                    style={{ textAlign: "center" }}
                  ></div>
                  <div id="role" className="bold italic"></div>
                  <div id="email" className="bold italic">
                    jane@example.com
                  </div>
                </li>
                <li>
                  <a href="#" onClick={handleRegister}>
                    <span className="material-symbols-outlined">
                      <img src={register} alt="" style={{ width: "30px" }} />
                    </span>
                    <span style={{ marginLeft: "15px" }}>Register</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleOpenSettings}>
                    <span className="material-symbols-outlined">
                      {" "}
                      <img src={setting} alt="" style={{ width: "30px" }} />
                    </span>{" "}
                    <span style={{ marginLeft: "15px" }}>Settings</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleAlarmNotifications}>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      {" "}
                      <img src={setting} alt="" style={{ width: "30px" }} />
                      {alarmCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            background: "red",
                            color: "white",
                            borderRadius: "50%",
                            width: "15px",
                            height: "15px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {alarmCount}
                        </span>
                      )}
                    </div>{" "}
                    <span style={{ marginLeft: "15px" }}>Alarm</span>
                  </a>
                </li>

                <li className="divider"></li>
                <li>
                  <a href="#" onClick={handleLogout}>
                    <span className="material-symbols-outlined">
                      {" "}
                      <img src={logout} alt="" style={{ width: "30px" }} />
                    </span>{" "}
                    <span style={{ marginLeft: "15px" }}>Logout</span>
                  </a>
                </li>
              </ul>
            </details>
          </div>
        </div>
        <div style={styles.container}>
          <div style={styles.battery}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.filler,
                  width: `${batteryPercentage}%`,
                  backgroundColor: getColor(batteryPercentage),
                }}
              ></div>
              <span style={styles.text}>{batteryPercentage}%</span>
            </div>
            <div style={styles.cap}></div>
          </div>
        </div>
        <div className="toggle-container">
            <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={isHoldActive}
                    onChange={toggleHold}
                    disabled={loading}
                />
                <span className="slider" />
            </label>
            <span className="status-label">
                {loading
                    ? "Processing..."
                    : isHoldActive
                    ? "Realese Cobot"
                    : "Hold Cobot"}
            </span>
        </div>
      </div>
    </div>
  );
};
const getColor = (percentage) => {
  if (percentage > 80) return "green";
  else if (percentage > 30 && percentage < 80) return "orange";
  else if (percentage < 30) return "red";
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  battery: {
    display: "flex",
    alignItems: "center",
  },
  progressBar: {
    width: "60px",
    height: "20px",
    backgroundColor: "#ddd",
    borderRadius: "3px",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid black",
  },
  filler: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    transition: "width 0.5s ease-in-out",
    zIndex: 1,
  },
  text: {
    position: "absolute",
    color: "#000",
    fontSize: "10px",
    fontWeight: "bold",
    zIndex: 2,
  },
  cap: {
    width: "3px",
    height: "8px",
    backgroundColor: "#333",
    borderTopRightRadius: "2px",
    borderBottomRightRadius: "2px",
    borderBottom: "1px solid black",
    borderRight: "1px solid black",
    borderTop: "1px solid black",
  },
};
export default Header;
