import React, { useEffect, useState, useContext } from "react";
import CreateMap from "./createmap_folder/CreateMap";
import "../../styles/Setup.css";
import config from "../../scripts/config.js";
import io from "socket.io-client";
import { MissionContext } from "../../context/MissionContext";
import EditMap from "./Edit_map";
import edit from "../../images/edit.png";
const ip = config.IP;
const port = config.PORT;

const Setup = () => {
  const [showModal, setShowModal] = useState(false);
  const [maps, setMaps] = useState([]);
  const [selectedMaps, setSelectedMaps] = useState([]);
  const [navigationType, setNavigationType] = useState("normal");
  const[isOpen,setIsOpen]=useState(false);
  // const [selectedMap, setSelectedMap] = useState("");

  const { selectedMap, setSelectedMap } = useContext(MissionContext);
  const [processStatus, setProcessStatus] = useState({
  gazebo: "stopped",
  navigation: "stopped",
  slam: "stopped",
});

  // initialize socket connection
  const socket = io(`http://${ip}:${port}`);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal1 = () => setIsOpen(true);
  const handleCloseModal1= () => setIsOpen(false);
  // Launching Gazeebo
  const launchGazebo = async () => {
    try {
      const response = await fetch("/launch_gazebo", { method: "POST" });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error("Error creating a map", err);
    }
  };

  // Launching slam naivigation
  const launchSlamGmapping = async () => {
    try {
      const response = await fetch("/launch_slam_gmapping", {
        method: "POST",
      });
      const data = await response.json();
      localStorage.setItem("operatingMode", "slam");
      alert(data.message);
    } catch (err) {
      console.error("Error launching mapping protocol", err);
    }
  };

  // generic function to terminate any running process
  const terminateProcess = async (processName) => {
    const alertMessage = document.createElement("div");
    alertMessage.innerText = "Terminating...";
    alertMessage.style.position = "fixed";
    alertMessage.style.top = "50%";
    alertMessage.style.left = "50%";
    alertMessage.style.transform = "translate(-50%, -50%)";
    alertMessage.style.backgroundColor = "#000";
    alertMessage.style.color = "#fff";
    alertMessage.style.padding = "20px";
    alertMessage.style.borderRadius = "8px";
    alertMessage.style.zIndex = "1000";
    document.body.appendChild(alertMessage);
    try {
      const response = await fetch(`/terminate/${processName}`, {
        method: "POST",
      });
      const data = await response.json();
      document.body.removeChild(alertMessage);
      alert(data.message);
      if (processName == "navigation") {
        localStorage.removeItem("selectedMap");
        localStorage.removeItem("operatingMode");
        localStorage.removeItem("selectedMaps"); 
        removeMapNameFromBackend();
        setSelectedMap("");
        setSelectedMaps([]);
        socket.emit("removeMapNameFromBackendServer");
      } else if (processName == "slam_gmapping") {
        localStorage.removeItem("operatingMode");
      }
    } catch (err) {
      console.error(`Error terminating the process ${processName}, ${err}`);
    }
  };

  // fetch maps to update the dropdown
  const fetchMapAndUpdateDropdown = async () => {
    try {
      const response = await fetch("/maps");
      const data = await response.json();
      setMaps(data);
    } catch (err) {
      console.error(`Error occured while fetching maps ${err}`);
    }
  };

  // Removing map name from the backend which is stored while launching the map
  const removeMapNameFromBackend = async () => {
    try {
      const url = `http://${ip}:${port}/api/removeMapName`;
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ name: "hi" }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
    } catch (error) {
      console.error("Error removing map name from backend:", error);
    }
  };

  // handling the selected map
  const handleMapSelection = (event) => {
    const selectedValue = event.target.value;
    
    if (navigationType === "restricted") {
      if (selectedMaps.length < 2 && !selectedMaps.includes(selectedValue)) {
         const updatedMaps = [...selectedMaps, selectedValue];
         setSelectedMaps(updatedMaps);
         localStorage.setItem("selectedMaps", JSON.stringify(updatedMaps)); 
      } else {
        alert("You can only select two maps for restricted navigation.");
      }
    } else {
      const updatedMaps = [selectedValue];
      setSelectedMaps(updatedMaps);
      localStorage.setItem("selectedMaps", JSON.stringify(updatedMaps));
    }
  };
  

  // function to launch navigation
  const launchNavigation = async () => {
    if (
      (navigationType === "restricted" && selectedMaps.length !== 2) ||
      (navigationType === "normal" && selectedMaps.length !== 1)
    ) {
      alert("Please select the appropriate number of maps before launching navigation.");
      return;
    }
  
    try {
      const response = await fetch("/launch_navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map_names: selectedMaps, navigation_type: navigationType }),
      });
      const data = await response.json();
      socket.emit("selectedMapNames", selectedMaps);
      localStorage.setItem("operatingMode", "nav");
      alert(
        data.success
          ? "Navigation launched successfully"
          : `Error occurred while launching Navigation: ${data.message}`
      );
    } catch (err) {
      console.error(`Error occurred while launching navigation ${err}`);
    }
  };

const editedRegex = /_v\d+$/;

const modifiedMaps = maps.filter(mapName => editedRegex.test(mapName));
const otherMaps = maps.filter(mapName => !editedRegex.test(mapName));
  useEffect(() => {
    fetchMapAndUpdateDropdown();
      const storedMaps = JSON.parse(localStorage.getItem("selectedMaps"));
      if (storedMaps && Array.isArray(storedMaps)) {
        setSelectedMaps(storedMaps);
      }

  const fetchStatus = async () => {
    try {
      const res = await fetch("/process_status");
      const data = await res.json();
      setProcessStatus(data);
    } catch (err) {
      console.error("Failed to fetch process status", err);
    }
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 3000); // refresh every 3s

  return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ label, status }) => (
  <span style={{
    marginRight: "15px",
    fontWeight: "bold",
    color: status === "running" ? "green" : "red"
  }}>
    {status === "running" ? "🟢" : "🔴"} {label}: {status === "running" ? "Running" : "Not Running"}
  </span>
);

  return (
<div className="setup-container">
 <h3>
  Setup your taurus
  <div style={{ marginTop: "8px", fontSize: "14px" }}>
    <StatusBadge label="Motor" status={processStatus.gazebo} />
    <StatusBadge label="Navigation" status={processStatus.navigation} />
  </div>
</h3>


  <div className="two-column-layout">
    {/* LEFT SIDE = Mapping + Manual Control */}
    <div className="left-column">
      <div className="top-sections">
        <div className="individual-sections">
          <h4>Mapping Section</h4>
          <button className="setupSection-button"
            onClick={() => {
              launchGazebo(); 
              launchSlamGmapping();
              handleOpenModal();
            }}>
            <span>+</span>
            <h6>Create Map</h6>
          </button>

          <CreateMap show={showModal} handleClose={handleCloseModal} />

          <button className="setupSection-button" onClick={handleOpenModal1}>
            <img src={edit} alt="edit-icon" style={{ width: "20px", height: "20px" }} />
            <h6 style={{ marginTop: "5px" }}>Edit Map</h6>
          </button>
          <EditMap showEdit={isOpen} EditHandleClose={handleCloseModal1} />
        </div>

        <div className="individual-sections">
          <h4>Manual Control Section</h4>

          <button className="setupSection-button" onClick={launchGazebo}>
            <h6>Start Manual Control</h6>
          </button>

          <button className="setupSection-button" onClick={() => terminateProcess("gazebo")}>
            <h6>Stop Manual Control</h6>
          </button>
        </div>
      </div>
    </div>

    {/* RIGHT SIDE = Navigation Section */}
    <div className="right-column">
      <div className="individual-sections">
        <h4>Navigation Section</h4>
        <h6>Please select a map from the dropdown</h6>

        <label>Select Navigation Type:</label>
        <select value={navigationType} onChange={(e) => { setNavigationType(e.target.value); setSelectedMaps([]); }}>
          <option value="normal">Navigation without Restricted Area</option>
          <option value="restricted">Navigation with Restricted Area</option>
        </select>

        {otherMaps.length > 0 && (
          <>
            <label>Select Map(s):</label>
            <select onChange={handleMapSelection}>
              <option value="">Select a map</option>
              {otherMaps.map((m, i) => <option key={i}>{m}</option>)}
            </select>
          </>
        )}

        {modifiedMaps.length > 0 && (
          <>
            <label>Select Modified/Edited Map(s):</label>
            <select onChange={handleMapSelection} disabled={navigationType === "normal"}>
              <option value="">Select modified map</option>
              {modifiedMaps.map((m, i) => <option key={i}>{m}</option>)}
            </select>
          </>
        )}

        <p>Selected Maps: {selectedMaps.join(", ")}</p>

        <div className="button-group">
          <button className="setupSection-button" onClick={launchNavigation} disabled={selectedMaps.length === 0}>
            <h6>Start Navigation</h6>
          </button>
          <button className="setupSection-button" onClick={() => terminateProcess("navigation")}>
            <h6>Stop Navigation</h6>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default Setup;