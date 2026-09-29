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

const socket = io(`http://${ip}:${port}`);

const Header = ({ toggleMenu, toggleLaunchers }) => {
  const [ros, setRos] = useState(null);
  const [missionState, setMissionState] = useState("paused");
  const [pausedBtnText, setPausedBtnText] = useState("-");
  // const pauseBtnRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHoldActive, setIsHoldActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { activeMission, setactive } = useContext(MissionContext);
  const [activePosition, setActivePosition] = useState("");
  const { setActiveQueuePosition } = useContext(MissionContext);

  const { selectedMap, setSelectedMap } = useContext(MissionContext);
  const [alarmStatus, setAlarmStatus] = useState(null);
  const [alarmCount, setAlarmCount] = useState(() => {
    return parseInt(localStorage.getItem("alarmCount")) || 0;
  });
  const [isActivated, setIsActivated] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(0);

  const navigate = useNavigate();


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


  useEffect(() => {
    const savedStatus = localStorage.getItem("missionStatus");

    if (savedStatus === "activated") {
      setPausedBtnText("Playing");
      setIsPlaying(true);
    } else if (savedStatus === "paused") {
      setPausedBtnText("Paused");
      setIsPlaying(false);
    } else {
      setPausedBtnText("_");
      setIsPlaying(false);
    }
  }, []);

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
        //removed from

    // const storedPausedBtnText = localStorage.getItem("pausedBtnText");
    // const storedActiveMission = localStorage.getItem("activeMission");
    //removed till

    // if (storedActiveMission) {
    //   setactive(storedActiveMission);
    // }

    // if (storedPausedBtnText) {
    //   setPausedBtnText(storedPausedBtnText);
    // }

        //removed from
    // if (storedActiveMission === "No active task") {
    //   console.log("stored active mission", storedActiveMission)
    //   setPausedBtnText("_");
    // } else if (storedActiveMission === "Aborted") {
    //   setPausedBtnText("Canceled");
    // }
        //removed till

    //  else if (!storedPausedBtnText && activeMission === "No active task") {
    //   setPausedBtnText("_");
    // }

    const newRos = new ROSLIB.Ros({
      url: `ws://${ip}:${webSocketPort}`,
    });
    newRos.on("connection", () => {
      console.log("Connected to WebSocket ROS server");
      setRos(newRos);
    });

    newRos.on("error", (error) => {
      console.error("Error connecting to WebSocket server:", error);
    });

    newRos.on("close", () => {
      console.log("Connection to WebSocket server closed");
    });
    const chargeTopic = new ROSLIB.Topic({
      ros: newRos,
      name: "/bms",
      messageType: "hw_t/bms",
    });

    chargeTopic.subscribe((message) => {
      setBatteryPercentage(message.soc);
    });

    //removed from
    // socket.on("missionComplete", handleMissionComplete);
        //removed till

    // socket.on("activeMissionUpdate", (missionName) => {
    //   setactive(missionName);
    //   if (missionName === "No active task") {
    //     setPausedBtnText("_");
    //     localStorage.setItem("pausedBtnText", "_");
    //   }
    //   if (missionName === "Aborted") {
    //     setPausedBtnText("Canceled");
    //     localStorage.setItem("pausedBtnText", "Canceled");
    //   } else {
    //     setPausedBtnText("Playing");
    //     localStorage.setItem("pausedBtnText", "Playing");
    //     // if(pauseBtnRef.current){
    //     //   pauseBtnRef.current.style.backgroundColor = 'green'
    //     //   pauseBtnRef.current.style.color = 'white';
    //     // }
    //   }
    //   // localStorage.setItem("activeMission", missionName);
    //   console.log("mission name", missionName)
    // });

        //removed from
    // socket.on("updatePausedBtnText", (text) => {
    //   setPausedBtnText(text);
    //   localStorage.setItem("pausedBtnText", text);
    // });
    // socket.on("updatecanceledBtnText", (text) => {
    //   setPausedBtnText(text);
    //   setactive("Aborted");
    //   localStorage.setItem("pausedBtnText", text);
    //   localStorage.setItem("activeMission", "Aborted");
    // });
    //removed till

    socket.on("Alarm", (message) => {
      //      alert(message.message)
      // setAlarmStatus(message);
      console.log("alarm message", message);
      setAlarmCount((prevCount) => prevCount + 1);
    });

    if (pausedBtnText === "Playing") {
      setIsPlaying(true);
    }
    // else {
    //   console.log("made falsee")
    //   setIsPlaying(false);
    // }

    socket.on("missionStatus", (value) => {
      console.log(value, 'logged value');
      if (value === "activated" || value == "play") {
        setPausedBtnText("Playing");
        console.log("value", value)
        setIsPlaying(true);
        localStorage.setItem("missionStatus", "activated");
      } else if (value === "paused") {
        setPausedBtnText("Paused");
        setIsPlaying(false);
        localStorage.setItem("missionStatus", "paused");
      } else if (value === "completed") {
        setPausedBtnText("Completed");
        setIsPlaying(false);
        localStorage.setItem("missionStatus", "Completed");
      } else {
        console.log(value, 'logged value')
        setPausedBtnText("_");
        console.log("making false if _")
        setIsPlaying(false);
        localStorage.setItem("missionStatus", "_");
      }
    });


    const interval = setInterval(() => {
      const param = new ROSLIB.Param({
        ros: newRos,
        name: "/positionName",
      });

      param.get((value) => {
        // console.log("Received ROS param:", value);
        setActivePosition(value);
        setActiveQueuePosition(value)
      });
    }, 1000);


    return () => {
          //removed from

      // socket.off("missionComplete", handleMissionComplete);
      // socket.off("activeMissionUpdate");
      // socket.off("updatePausedBtnText");
      // socket.off("updatecanceledBtnText");
          //removed till

      socket.off("missionStatus");
      chargeTopic.unsubscribe();
      clearInterval(interval);
    };
    setRos(newRos);
    // Clean up ROS connection on unmount
    // return () => {
    //   newRos.close();
    // };
  }, [pausedBtnText]);


  useEffect(() => {
    if (!ros) return;

    const param = new ROSLIB.Param({
      ros: ros,
      name: "/activationControl",
    });

    const getParam = () => {
      param.get((value) => {
        // console.log("activationControl param:", value);
        setIsActivated(value === 1);
      });
    };

    getParam();
    const interval = setInterval(getParam, 1000);
    return () => clearInterval(interval);
  }, [ros]);

  useEffect(() => {
    socket.on("missionNameUpdate", (missionName) => {
      console.log("🚀 Received missionNameUpdate:", missionName);
      setactive(missionName);
    });

    return () => {
      socket.off("missionNameUpdate");
    };
  }, []);

      //removed from

  // const handleMissionComplete = () => {
  //   // setactive("No active task");
  //   setPausedBtnText("_");
  //   localStorage.setItem("pausedBtnText", "_");
  //   // localStorage.setItem("activeMission", "No active task");
  //   console.log("setting to localstorage of activemission")
  //   socket.emit("updatePausedBtnText", "_");

  //   const missionName = document
  //     .getElementById("activemissionname")
  //     .innerText.replace("Task: ", "");
  //   const status = document.getElementById("pausedbtn").innerText;

  //   // Adding some logic to emit this only once and not thrice ---- Bug fix -Shoaib
  //   if (missionName !== "No active task") {
  //     socket.emit("missionComplete1", { missionName, status });
  //   }
  //   // socket.emit("missionComplete1", { missionName, status });
  // };
    //removed till



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
        //removed from
    // localStorage.setItem("pausedBtnText", "Playing");
        //removed till

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
        //removed from
    // localStorage.setItem("pausedBtnText", "Paused");
        //removed till

  };

  const togglePlayPause = () => {
    if (isPlaying) {
      socket.emit("setMissionParam", "paused");
      pauseMission();
      setPausedBtnText("Paused");
      setIsPlaying(false);
    } else {
      socket.emit("setMissionParam", "play");
      playMission();
      setPausedBtnText("Playing");
      setIsPlaying(true);
    }
  };

  // const shouldShowPauseButton = pausedBtnText === "Playing";
  const shouldShowPauseButton = isPlaying;
  console.log("shouldShowPauseBuuton", shouldShowPauseButton)


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
        //removed from
    // localStorage.setItem("pausedBtnText", "Canceled");
        //removed till

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

    const holdState = isHoldActive ? 0 : 1;
    console.log(`Sending hold state: ${holdState}`);

    try {
      const response = await fetch(`http://${ip}:${port}/connect-to-robot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hold: holdState }),
      });

      const result = await response.json();
      console.log(result.message || result.error);
      setIsHoldActive((prev) => !prev);
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
          <div
            id="toggleButton"
            className={!isActivated ? "disabled-button-wrapper" : ""}
            title={!isActivated ? "⚠️ Start A Mission To Enable" : ""}
          >
            <button
              onClick={isActivated ? togglePlayPause : null}
              disabled={!isActivated}
              style={{
                backgroundColor: "#e2d1c3",
                border: "none",
                cursor: isActivated ? "pointer" : "not-allowed",
                opacity: isActivated ? 1 : 0.5,
              }}
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

          <div
            id="emgncybutton"
            className={!isActivated ? "disabled-button-wrapper" : ""}
            title={!isActivated ? "⚠️ Start A Mission To Enable" : ""}
          >
            <img
              src={emergency}
              className="icn3 menuicn"
              id="cancelmission"
              alt="emergency-icon"
              onClick={isActivated ? cancelMission : null}
              style={{
                width: "50px",
                height: "50px",
                cursor: isActivated ? "pointer" : "not-allowed",
                opacity: isActivated ? 1 : 0.5,
              }}
            />
          </div>
        </div>


        <div id="mission-info" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px", }}>
          {/* Position Section */}
          <div id="position-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p id="activemissionname" style={{ fontSize: "15px", margin: 0 }}>
              {activePosition ? `Position: ${activePosition}` : ""}
            </p>
          </div>

          {/* Task Section */}
          <div id="task-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p id="activemissionname" style={{ fontSize: "15px", margin: 0 }}>
              {activeMission ? `Task: ${activeMission}` : "No active task"}
            </p>
          </div>
        </div>

        <div>    <button id="pausedbtn">{pausedBtnText}</button>
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
        {/* <div className="toggle-container">
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
        </div> */}
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
