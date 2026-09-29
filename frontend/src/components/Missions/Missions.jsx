import React, { useEffect, useState } from "react";
import "../../styles/missions.css";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import config from "../../scripts/config";

const ip = config.IP;
const port = config.PORT;

const Missions = () => {
  const [missionData, setMissionData] = useState({});
  const [editIndex, setEditIndex] = useState({
    dataIndex: null,
    missionIndex: null,
  });
  const [editValue, setEditValue] = useState("");
  const [draggedMission, setDraggedMission] = useState(null);
  const [droppedMissions, setDroppedMissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://${ip}:${port}/api/Missions`);
        const data = await response.json();
        setMissionData(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (date, index) => {
    try {
      const response = await fetch(`http://${ip}:${port}/api/delete3`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, index }),
      });

      if (response.ok) {
        const updatedMissionData = missionData
          .map((item) => {
            if (item.date === date) {
              const updatedQueue = item.missionQueue.filter(
                (_, idx) => idx !== index
              );
              return { ...item, missionQueue: updatedQueue };
            }
            return item;
          })
          .filter((item) => item.missionQueue.length > 0);
        setMissionData(updatedMissionData);
      } else {
        console.error("Failed to delete task:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditClick = (dataIndex, missionIndex, currentValue) => {
    setEditIndex({ dataIndex, missionIndex });
    setEditValue(currentValue);
  };
  const handleSaveClick = async (dataIndex, missionIndex) => {
    try {
      const date = missionData[dataIndex].date;
      const missionId = missionData[dataIndex].missionQueue[missionIndex].id;
      const response = await fetch(
        `http://${ip}:${port}/api/update-mission-input`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date, missionId, newInputValue: editValue }),
        }
      );
      setEditIndex({ dataIndex: null, missionIndex: null });
    } catch (error) {
      console.error("Error saving edited input:", error);
    }
  };

  const handleDragStart = (dataIndex, missionIndex, mission) => {
    setDraggedMission({ dataIndex, missionIndex, mission });
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (draggedMission) {
      const { dataIndex, missionIndex, mission } = draggedMission;
      const date = missionData[dataIndex].date;
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the mission "${mission.missionName}" from "${date}" ?`
      );

      if (confirmDelete) {
        handleDelete(date, missionIndex);

        // Add dropped mission to the droppedMissions state
        setDroppedMissions((prev) => [...prev, mission]);
      }

      setDraggedMission(null);
    }
  };

  const handleTouchStart = (dataIndex, missionIndex, mission) => {
    setDraggedMission({ dataIndex, missionIndex, mission });
  };

  const handleTouchEnd = (e) => {
    const dropTarget = document.elementFromPoint(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    );

    if (dropTarget && dropTarget.id === "dndDiv") {
      handleDrop(e);
    }
  };

  return (
    <div id="mainMissionDiv">
      <div id="missions">
        <h1 id="mission-header">Missions</h1>

        <div id="mission-table">
          {missionData.length > 0 ? (
            <table>
              <tbody>
                {missionData.map((data, dataIndex) => (
                  <React.Fragment key={dataIndex}>
                    {data.missionQueue.length > 0 && (
                      <tr>
                        <td colSpan={3}>Date: {data.date}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3}>
                        <div id="mission-data">
                          {data.missionQueue.map((mission, missionIndex) => (
                            <div
                              id="mission-div"
                              key={missionIndex}
                              draggable
                              onDragStart={() =>
                                handleDragStart(
                                  dataIndex,
                                  missionIndex,
                                  mission
                                )
                              }
                              onTouchStart={() =>
                                handleTouchStart(
                                  dataIndex,
                                  missionIndex,
                                  mission
                                )
                              }
                              onTouchEnd={handleTouchEnd}
                            >
                              <Button className="mission-button">
                                {mission.missionName}
                              </Button>
{/* 
                              <label style={{ marginLeft: "10px" }}>
                                {mission.inputValue}
                              </label> */}

                              {editIndex.dataIndex === dataIndex &&
                              editIndex.missionIndex === missionIndex ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  style={{ marginLeft: "10px" }}
                                />
                              ) : (
                                <label style={{ marginLeft: "10px" }}>
                                  {mission.inputValue}
                                </label>
                              )}
                              {editIndex.dataIndex === dataIndex &&
                              editIndex.missionIndex === missionIndex ? (
                                <button
                                  onClick={() =>
                                    handleSaveClick(dataIndex, missionIndex)
                                  }
                                  style={{
                                    marginLeft: "10px",
                                    padding: "5px 10px",
                                  }}
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleEditClick(
                                      dataIndex,
                                      missionIndex,
                                      mission.inputValue
                                    )
                                  }
                                  style={{
                                    marginLeft: "10px",
                                    padding: "5px 10px",
                                    border: "1px solid #d4b4a2",
                                    backgroundColor: "#d6d2d0",
                                    borderRadius:"5px"
                                    
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faEdit}
                                    style={{
                                      fontSize: "1.5em",
                                    }}
                                  />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Data Available</p>
          )}
        </div>
      </div>
      <div>
        <div></div>
        {missionData.length > 0 ? (
          <div
            id="dndDiv"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: "2em" }} />

            <h5 id="mission-dndHeader"> Drop Here To Delete</h5>
            {/* <div style={{ marginTop: "10px" }}>
          {droppedMissions.map((mission, index) => (
            <div
              key={index}
              style={{
                padding: "5px",
                border: "1px solid #d4b4a2",
                borderRadius: "5px",
                marginBottom: "5px",
                backgroundColor: "#f4f4f4",
              }}
            >
              {mission.missionName}
            </div>
          ))}
        </div> */}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Missions;
