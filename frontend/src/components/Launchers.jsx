import React, { useEffect, useState } from "react";
import "../styles/launchers.css";
import config from "../scripts/config.js";

const ip = config.IP;
const port = config.PORT;
// const webSocketPort = config.WEBSOCKET_PORT;

const Launchers = ({ isOpen1 }) => {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState("");

  const fetchMaps = async () => {
    try {
      const response = await fetch("/maps");
      const data = await response.json();
      setMaps(data);
    } catch (error) {
      console.error("Error fetching maps:", error);
    }
  };

  const launchNavigation = async (mapName) => {
    if (mapName) {
      try {
        const response = await fetch("/launch_navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ map_name: mapName }),
        });
        const data = await response.json();
        localStorage.setItem("operatingMode", "nav");
        localStorage.setItem("selectedMap", mapName);
        alert(
          data.success
            ? "Navigation launched successfully."
            : `Error launching navigation: ${data.message}`
        );
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("Please select a map.");
    }
  };

  const saveMap = async () => {
    const mapName = prompt("Enter map name:");
    const userName = localStorage.getItem("UserName");
    if (mapName) {
      try {
        const response = await fetch("/save_map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: mapName, user: userName }),
        });
        const data = await response.json();
        alert(data.message);
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (!userName) {
      alert("user name is not set in local storge.");
    }
  };

  useEffect(() => {
    const savedMap = localStorage.getItem("selectedMap");
    if (savedMap) {
      setSelectedMap(savedMap);
    }
  }, []);

  const launchGazebo = async () => {
    try {
      const response = await fetch("/launch_gazebo", { method: "POST" });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const launchSlamGmapping = async () => {
    try {
      const response = await fetch("/launch_slam_gmapping", { method: "POST" });
      const data = await response.json();
      localStorage.setItem("operatingMode", "slam");
      alert(data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const removeMapNameFromBackend = async () => {
    try {
      const url = `http://${ip}:${port}/api/removeMapName`;
      const response = await fetch(
        "http://192.168.0.47:3001/api/removeMapName",
        {
          method: "POST",
          body: JSON.stringify({ name: "hi" }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
    } catch (error) {
      console.error("Error removing map name from backend:", error);
    }
  };

  const terminateProcess = async (processName) => {
    try {
      const response = await fetch(`/terminate/${processName}`, {
        method: "POST",
      });
      const data = await response.json();
      alert(data.message);
      if (processName == "navigation") {
        localStorage.removeItem("selectedMap");
        removeMapNameFromBackend();
        localStorage.removeItem("operatingMode");
      } else if (processName == "slam_gmapping") {
        localStorage.removeItem("operatingMode");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateMapDropdown = async () => {
    try {
      const response = await fetch("/maps");
      const data = await response.json();
      setMaps(data);
    } catch (error) {
      console.error("Error fetching maps:", error);
    }
  };

  const handleMapSelection = (event) => {
    const mapName = event.target.value;
    setSelectedMap(mapName);

    launchNavigation(mapName);
  };

  const editMap = async () => {
    if (selectedMap) {
      const newName = prompt("Enter the new name for the map:", selectedMap);
      if (newName && newName !== selectedMap) {
        try {
          const response = await fetch("/edit_map", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldName: selectedMap, newName }),
          });
          const data = await response.json();
          if (data.success) {
            alert("Map name updated successfully!");
            updateMapDropdown(); // Refresh dropdown
          } else {
            alert("Failed to update map name.");
          }
        } catch (error) {
          console.error("Error updating map name:", error);
        }
      }
    }
  };

  const deleteMap = async () => {
    if (
      selectedMap &&
      window.confirm("Are you sure you want to delete this map?")
    ) {
      try {
        const response = await fetch("/delete_map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selectedMap }),
        });
        const data = await response.json();
        if (data.success) {
          alert("Map deleted successfully!");
          updateMapDropdown(); // Refresh dropdown
          setSelectedMap(""); // Clear selection
        } else {
          alert("Failed to delete map.");
        }
      } catch (error) {
        console.error("Error deleting map:", error);
      }
    }
  };

  useEffect(() => {
    fetchMaps();
    updateMapDropdown();
  }, []);

  return (
    <div
      id={`container ${isOpen1 ? "" : "navclose1"}`}
      style={{
        marginTop: "81px",
        display: "flex",
        marginBottom: "-75px",
        borderBottom: "5px solid black",
      }}
    >
      <div id="left-pane">
        <h1>Mapping</h1>
        <button
          className="launch"
          onClick={() => {
            launchGazebo(), launchSlamGmapping();
          }}
        >
          Create Map
        </button>
        <button className="launch" onClick={saveMap}>
          Save Map
        </button>
        <button
          className="ter"
          onClick={() => {
            terminateProcess("slam_gmapping");
            terminateProcess("gazebo");
          }}
        >
          Stop
        </button>
      </div>
      <div id="middle-pane">
        <div className="button-group">
          <h1>Manual Control</h1>
          <button className="launch" onClick={launchGazebo}>
            Start
          </button>
          <button className="ter" onClick={() => terminateProcess("gazebo")}>
            Stop
          </button>
        </div>
      </div>
      <div id="right-pane">
        <div id="dropdown-container">
          <h1>Navigation</h1>
          <select
            id="mapDropdown"
            value={selectedMap}
            onChange={handleMapSelection}
          >
            <option value="">Select a map</option>
            {maps.map((mapName) => (
              <option key={mapName} value={mapName}>
                {mapName}
              </option>
            ))}
          </select>
          <button
            id="editButton"
            style={{ display: selectedMap ? "inline" : "none" }}
            onClick={editMap}
          >
            Rename
          </button>
          {/* <button
            id="deleteButton"
            style={{ display: selectedMap ? "inline" : "none" }}
            onClick={() => {
              deleteMap();
              terminateProcess("navigation");
            }}
          >
            Delete Map
          </button> */}
          <button
            className="ter"
            onClick={() => terminateProcess("navigation")}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Launchers;
