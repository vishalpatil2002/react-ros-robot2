import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Overlay from "react-bootstrap/Overlay";
import Modal from "react-bootstrap/Modal";
import Tooltip from "react-bootstrap/Tooltip";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import trash from "../../images/trash.png";
import edit from "../../images/edit.png";
import savemission from "../../images/savemission.png";
import updatemission from "../../images/updatemission.png";
import submit from "../../images/submit.png";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/PositionData.css";
import { MissionContext } from "../../context/MissionContext";
import config from "../../scripts/config.js";
import { useNavigate } from "react-router-dom";

const ip = config.IP;
const port = config.PORT;

const PositionData = ({ isMenuOpen }) => {
  const [positions, setPositions] = useState([]);
  const [queue, setQueue] = useState([]);
  const [nameQueue, setNameQueue] = useState([]);
  const [missionData, setMissionData] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [tooltipData, setTooltipData] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [target, setTarget] = useState(null);
  const [tooltipContent, setTooltipContent] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [missionQueue, setMissionQueue] = useState([]);
  const [showModal, setshowModal] = useState(false);
  const [description, setDescription] = useState([]);
  const { setactive } = useContext(MissionContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMissionName, setEditingMissionName] = useState("");
  const [waitTimes, setWaitTimes] = useState([1]);
  const [draggedMission, setDraggedMission] = useState(null);
  const [draggedPositionName, setDraggedPositionName] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [dropSelections, setDropSelections] = useState({});
  const socket = io(`http://${ip}:${port}`);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://${ip}:${port}/api/data`);
      console.log(response.data)
      setPositions(response.data);
    } catch (error) {
      // alert("Navigate to setup screen and select a map from the dropdown");
      // console.error("Error fetching data:", error);
      navigate("/setup")
    }
  };

  const fetchMissionData = async () => {
    try {
      const response = await fetch(`http://${ip}:${port}/api/missionData`);
      const data = await response.json();
      if (data.length > 0) {
        setMissionData(data);
      } else {
        console.log("No new data received");
      }
    } catch (error) {
      // alert("Navigate to setup page and select a map from the dropdown");
      console.error("Error fetching mission data:", error);
    }
  };

  const fetchTooltipData = async (queue) => {
    try {
      const response = await fetch(`http://${ip}:${port}/api/missiontoolip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tooltipMissionName: queue }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tooltip data:", error);
      return [];
    }
  };

  useEffect(() => {
    const mapName = localStorage.getItem("selectedMaps");
    console.log("mapnames ",mapName)
    if(!mapName)       alert("Navigate to setup screen and select a map from the dropdown");
    if (mapName) {
      fetch(`http://${ip}:${port}/api/sendUserName`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mapName }),
      });
    }
    // if (selectedMap) {
    fetchData();
    console.log('Called fetch data method')
    fetchMissionData();
    fetchRegisteredUsers();
    // }
    // Fetch mission data on component mount
  }, []);

  const handleButtonClick = (position) => {
    setQueue((prevQueue) => {
      const updatedQueue = [
        ...prevQueue,
        position._id ? position._id : position.name,
      ];
      return updatedQueue;
    });
    setNameQueue((prevNameQueue) => {
      const updatedNameQueue = [...prevNameQueue, position.name];
      return updatedNameQueue;
    });
  };
  const handleDeleteForPosition = async (positionName) => {
    try {
      const response = await fetch(`http://${ip}:${port}/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ positionName }),
      });
      if (response.ok) {
        const updatePostions = positions.filter(
          (item) => item.name !== positionName
        );
        setPositions(updatePostions);
      } else {
        console.log("Failed to delete Position", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting Positions", error);
    }
  };

  const handleDropForPosition = (e) => {
    e.preventDefault();

    if (draggedPositionName) {
      const { positionName } = draggedPositionName;

      const confirmDelete = window.confirm(
        `Are you sure you want to delete the poistion "${positionName}"`
      );

      if (confirmDelete) {
        handleDeleteForPosition(positionName);
      }
      setDraggedPositionName(null);
    }
  };
  const handleDragStartForPosition = (positionName) => {
    setDraggedPositionName({ positionName });
  };

  const handleTouchStartForPosition = (positionName) => {
    setDraggedPositionName({ positionName });
  };

  const handleTouchEndForPosition = (e) => {
    const dropTarget = document.elementFromPoint(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    );

    if (dropTarget && dropTarget.id === "dndDivForPosition") {
      handleDropForPosition(e);
    }
  };
  // const handleTrashClick = (position) => {
  //   const index = queue.indexOf(position._id);
  //   if (index !== -1) {
  //     const updatedQueue = [...queue];
  //     updatedQueue.splice(index, 1);
  //     setQueue(updatedQueue);
  //   }
  // };

  const handleTrashClick = (indexToRemove) => {
    // Ensure indexToRemove is within valid range of the array
    if (indexToRemove >= 0 && indexToRemove < queue.length) {
      // Create copies of the current state arrays
      const updatedQueue = [...queue];
      const updatedNameQueue = [...nameQueue];

      // Remove the item at indexToRemove from queue and nameQueue
      updatedQueue.splice(indexToRemove, 1);
      updatedNameQueue.splice(indexToRemove, 1);

      // Update the state with the modified arrays
      setQueue(updatedQueue);
      setNameQueue(updatedNameQueue);
    } else {
      console.warn("Invalid index to remove:", indexToRemove);
    }
  };

  const handleDelete = async (missionName) => {
    try {
      const response = await fetch(`http://${ip}:${port}/api/delete2`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: missionName }),
      });

      if (response.ok) {
        const updatedMissionData = missionData.filter(
          (item) => item.queueData.missionName !== missionName
        );
        setMissionData(updatedMissionData);
      } else {
        console.error("Failed to delete mission:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting mission:", error);
    }
  };

  const handleEdit = async (array, name) => {
    document.getElementById("missionNameInput").value = name;
    const data = await fetchTooltipData(array);
    setNameQueue(data.searchResults);
    setQueue(array);
    setIsEditing(true);
    setEditingMissionName(name);
  };

  const checkMissionNameExists = async (missionName) => {
    try {
      const response = await axios.get(
        `http://${ip}:${port}/check-mission-name`,
        { params: { name: missionName } }
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error checking mission name:", error);
      return false;
    }
  };

  const sendQueueToServer = async () => {
    const missionName = document
      .getElementById("missionNameInput")
      .value.trim();

    if (missionName === "") {
      alert("Mission Name cannot be empty");
      return;
    } else if (queue.length === 0) {
      alert("Choose positions for the task");
      return;
    }

    if (!isEditing) {
      const missionNameExists = await checkMissionNameExists(missionName);

      if (missionNameExists) {
        alert("Mission name already exists");
        return;
      }
    }

    // For adding waiting time logic and sending it to server

    const missionQueueWithWaitTimes = queue.map((item, index) => {
      const positionId = typeof item === "string" ? item : item.positionId;
      const waitTime =
        nameQueue[index] === "Wait" ? waitTimes[index] || 0 : null;
  
      let dropPositionId = null;
  
      if (nameQueue[index] === "Drop") {
        const selectedDropName = dropSelections[index];
        const dropPosition = positions.find((pos) => pos.name === selectedDropName);
        dropPositionId = dropPosition?._id || null;
      }
  
      return {
        positionId,
        waitTime,
        ...(dropPositionId && { dropPositionId })  // add only if not null
      };
    });
  

    const mission = { missionName, queue: missionQueueWithWaitTimes };

    fetch(`http://${ip}:${port}/api/send`, {
      method: "POST",
      body: JSON.stringify({ mission, editingMissionName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          setQueue([]);
          setNameQueue([]);
          document.getElementById("missionNameInput").value = "";
          fetchMissionData();
          setIsEditing(false);
          setEditingMissionName("");
          setWaitTimes(null);
          setDropSelections({});
        } else {
          console.error("Error sending queue:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error sending queue:", error);
      });
  };

  const addMissionToQueue = (item) => {
    const instanceId = uuidv4();
    setMissionQueue((prevQueue) => [
      ...prevQueue,
      {
        instanceId,
        id: item._id,
        name: item.queueData.missionName,
        inputValue: "",
      },
    ]);
  };

  const handleInputChange = (instanceId, value) => {
    setMissionQueue((prevQueue) =>
      prevQueue.map((mission) =>
        mission.instanceId === instanceId
          ? { ...mission, inputValue: value }
          : mission
      )
    );
  };

  const sendMissionQueueToBackend = async () => {
    const hasEmptyInput = missionQueue.find(
      (mission) => mission.inputValue.trim() === "" || isNaN(mission.inputValue)
    );

    if (hasEmptyInput) {
      alert(`Input value for mission "${hasEmptyInput.name}" cannot be empty`);
      return;
    }

    console.log("selected user", selectedUser);
// 
    // if (!selectedUser) {
      // alert("Please select a user from the dropdown");
      // return;
    // }
    try {
      const formattedDate = startDate.toLocaleDateString("en-US");
      const dataToSend = {
        date: formattedDate,
        missionQueue: missionQueue.map((mission) => ({
          id: mission.id,
          inputValue: parseInt(mission.inputValue),
          missionName: mission.name,
        })),
        // userName: selectedUser,
      };

      const response = await fetch(
        `http://${ip}:${port}/api/sendMissionQueue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send missionQueue");
      }

      const result = await response.json();
      console.log("result", result)
      setMissionQueue([]);
      toast.info(`Queue Submitted SuccessFully`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDragStart = (name) => {
    setDraggedMission({ name });
  };
  const handleDrop = (e) => {
    e.preventDefault();

    if (draggedMission) {
      const { name } = draggedMission;

      const confirmDelete = window.confirm(
        `Are you sure you want to delete the mission "${name}"?`
      );

      if (confirmDelete) {
        handleDelete(name);

        // Add dropped mission to the droppedMissions state
        // setDroppedMissions((prev) => [...prev, mission]);
      }

      setDraggedMission(null);
    }
  };
  const handleTouchStart = (name) => {
    setDraggedMission({ name });
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

  const activateMission = () => {
    if (!activeMission || activeMission._id === undefined) {
      alert("Choose a mission");
      return;
    } else {
      const missionName = activeMission.queueData.missionName;

      const missionId = activeMission._id;

      setactive(missionName);
      fetch(`http://${ip}:${port}/api/activeMission`, {
        method: "POST",
        body: JSON.stringify({ missionId, missionName }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            setActiveMission(null);
          } else {
            console.error("Error sending queue:", response.statusText);
          }
        })
        .catch((error) => {
          console.error("Error sending queue:", error);
        });
    }
  };

  const handleQueue = async (event, queue) => {
    setTarget(event.target); // Set the target for Overlay

    if (activeTooltip === queue && showModal) {
      setshowModal(false);
      setActiveTooltip(null);
      return;
    }

    // if (!tooltipData[queue]) {
    const data = await fetchTooltipData(queue);
    setTooltipData((prevTooltipData) => ({
      ...prevTooltipData,
      [queue]: data.searchResults,
    }));
    setTooltipContent(data.searchResults);
    setDescription(data.description);
    // } else {
    // console.log('Since tool tip data is not present, loading new tool tip data');
    // setTooltipContent(tooltipData[queue]);
    // console.log(tooltipContent, tooltipData);
    // }

    setActiveTooltip(queue);
    setshowModal(true); // Show tooltip after data is fetched
  };

  const handleToastClick = (name) => {
    // toast.info(`${position.name}\nQueue Added: ${queue.join(", ")}`);
    toast.info(`Task : ${name}\n Selected`);
  };

  // fetch users from the list of all registered users
  const fetchRegisteredUsers = async () => {
    try {
      const response = await fetch(
        `http://${ip}:${port}/api/get/registeredUsers`
      );
      const data = await response.json();
      console.log(data.data);
      setRegisteredUsers(data.data);
    } catch (err) {
      console.error(`Error fetching registered users`, err);
    }
  };

  const handleUserSelection = (event) => {
    const userName = event.target.value;
    setSelectedUser(userName);
  };

  const CloseModal = () => {
    setshowModal(false);
  };
  return (
    <div id="app">
      <ToastContainer
        className="toast-container"
        autoClose={1000}
        toastStyle={{
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "16px",
          padding: "16px",
        }}
      />

      <div id="position-container" className={isMenuOpen ? "menu-open" : ""}>
        <h1 id="position-header">Positions</h1>
        <div
          id="tasks-dndDiv"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropForPosition}
        >
          <FontAwesomeIcon icon={faTrash} style={{ fontSize: "2em" }} />
          <h5 id="task-dndHeader">Drop here To Delete</h5>
        </div>
        <div
          id="position-div"
          style={{
            // border: "1px solid black",
            borderRadius: "15px",
            // width: "300px",
            maxHeight: "350px",
            overflowY: "auto",
            overflowX: "hidden",
            marginTop: "15px",
          }}
        >
          {positions.map((position, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                marginBottom: "5px",
                marginTop: "10px",
              }}
            >
              <Button
                className="delete"
                id="positions"
                variant="success"
                style={{
                  borderRadius: "5px",
                  fontSize: "15px",
                  height: "40px",
                  minWidth: "150px",
                  width: "auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  // backgroundColor: "#d6d2d0",
                  border: "1px solid #d4b4a2",

                  // color: "#042159",
                  color: "black",
                }}
                onClick={() => {
                  handleButtonClick(position);
                  // handleToastClick(position);
                }}
                draggable
                onDragStart={() => handleDragStartForPosition(position.name)}
                onTouchStart={() => handleTouchStartForPosition(position.name)}
                onTouchEnd={handleTouchEndForPosition}
              >
                {position.name}
              </Button>
              {/* <i
                className="fa-solid fa-trash-can"
                style={{
                  cursor: "pointer",
                  color: "#E40078",
                  fontSize: "30px",
                }}
                onClick={() => handleTrashClick(position)}
              ></i> */}
            </div>
          ))}
        </div>
      </div>
      <div id="queue" className={isMenuOpen ? "menu-open" : ""}>
        <h3 id="queue-header">{isEditing ? "Update " : "Create"} a Mission</h3>
        <div>
          <input
            type="text"
            id="missionNameInput"
            className={isMenuOpen ? "menu-open" : ""}
            placeholder="Enter Task Name"
            style={{
              // width: "320px",
              height: "40px",
              // marginTop: "15px",
              marginBottom: "10px",
              marginLeft: "10px",
              // borderRadius: "7px",
            }}
          />
        </div>
        <div>
          {" "}
          <button
            className="save-task"
            style={{ width: "160px" }}
            onClick={sendQueueToServer}
          >
            {isEditing ? (
              <img
                src={updatemission}
                style={{
                  width: "30px",
                  marginRight: "15px",
                  color: "#E40078",
                }}
              />
            ) : (
              <img
                src={savemission}
                style={{
                  width: "30px",
                  marginRight: "15px",
                  color: "#E40078",
                }}
              />
            )}
            {isEditing ? "Update Mission" : "Save Mission"}{" "}
          </button>
        </div>
        <div id="queuePositions">
          {queue.map((position, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                // marginBottom: "5px",
                // marginTop: "10px",
              }}
            >
              <Button
                variant="info"
                id="positions"
                style={{
                  borderRadius: "5px",
                  fontSize: "15px",
                  height: "40px",
                  minWidth: "150px",
                  width: "auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  border: "1px solid #d4b4a2",
                  marginTop: "0px",
                }}
              >
                {nameQueue[index]}
              </Button>
              {nameQueue[index] === "Wait" ? (
                <div>
                  <input
                    style={{
                      width: "50px",
                      border: "none",
                      borderBottom: "1px solid black",
                    }}
                    type="number"
                    placeholder="in sec"
                    value={waitTimes?.[index] || ""}
                    onChange={(e) =>
                      setWaitTimes((prevTimes) => ({
                        ...prevTimes,
                        [index]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </div>
              ) : nameQueue[index] === "Drop" ? (
                <div>
                  <select
                    style={{
                      height: "35px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    value={dropSelections?.[index] || ""}
                    onChange={(e) =>
                      setDropSelections((prevSelections) => ({
                        ...prevSelections,
                        [index]: e.target.value,
                      }))
                    }
                  >
                    <option value="" disabled>
                      Select position
                    </option>
                    {positions.map((pos, i) => (
                      <option key={i} value={pos.name}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}


              {/* <i
                className="fa-solid fa-trash-can"
                style={{
                  cursor: "pointer",
                  color: "#E40078",
                  fontSize: "30px",
                }}
                onClick={() => handleTrashClick(index)}
              ></i> */}
              <button
                variant="link"
                className="delete"
                onClick={() => handleTrashClick(index)}
                style={{
                  height: "68px",
                  border: "none",
                  backgroundColor: "transparent",
                }}
              >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: "1.5em" }} />
              </button>

              {/* <img
                src={trash}
                alt=""
                style={{
                  width: "30px",
                  height: "25px",
                  color: "#E40078",
                }}
                onClick={() => handleTrashClick(index)}
              /> */}
            </div>
          ))}
        </div>{" "}
      </div>
      <div className={`container ${isMenuOpen ? "menu-open" : ""}`}>
        <div>
          {" "}
          <h1 className="missionHeader">Missions</h1>
        </div>
        {/* <button
          id="activatemission"
          className="activate-button"
          onClick={activateMission}
        >
          Activate Task
        </button> */}
        <div
          id="tasks-dndDiv"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <FontAwesomeIcon icon={faTrash} style={{ fontSize: "2em" }} />
          <h5 id="task-dndHeader">Drop here To Delete</h5>
        </div>
        <div className="div-button">
          {missionData.map((item) => (
            <div key={item.queueData.missionName}>
              <button
                className="task-button"
                onClick={() => {
                  setActiveMission(item);
                  addMissionToQueue(item);
                  localStorage.setItem(
                    "activeMissionName",
                    item.queueData.missionName
                  );
                  handleToastClick(item.queueData.missionName);
                }}
                draggable
                onDragStart={() => handleDragStart(item.queueData.missionName)}
                onTouchStart={() =>
                  handleTouchStart(item.queueData.missionName)
                }
                onTouchEnd={handleTouchEnd}
              >
                {item.queueData.missionName}
              </button>
              <button
                className="info-button"
                onClick={(e) => handleQueue(e, item.queueData.queue)}
                style={{ backgroundColor: "transparent" }}
              >
                &#9432;
              </button>
              {/* <button
                className="delete-button"
                onClick={() => handleDelete(item.queueData.missionName)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "23px",
                }}
              >
              <FontAwesomeIcon
                    icon={faTrash}
                    style={{ fontSize: "1.5em" }}
                  />
              </button> */}
              <button
                className="edit-button"
                onClick={() =>
                  handleEdit(item.queueData.queue, item.queueData.missionName)
                }
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "23px",
                }}
              >
                <FontAwesomeIcon icon={faEdit} style={{ fontSize: "1.5em" }} />
              </button>
              <Overlay target={target} show={showTooltip} placement="right">
                {(props) => (
                  <Tooltip id="overlay-example" {...props}>
                    <div
                      style={
                        {
                          // backgroundColor: "white",
                          // border: "1px solid black",
                          // padding: "10px",
                          // borderRadius: "5px",
                        }
                      }
                    >
                      <ul>
                        {tooltipContent.map((data, idx) => (
                          <li key={idx}>{data}</li>
                        ))}
                      </ul>
                    </div>
                  </Tooltip>
                )}
              </Overlay>

              <Modal show={showModal} onHide={CloseModal} backdrop={false}>
                <Modal.Header closeButton>
                  <Modal.Title>Positions With Description</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div>
                    {tooltipContent.map((position, idx) => (
                      <div key={idx} style={{ marginBottom: "15px" }}>
                        <strong>Position Name:</strong> {position}
                        <br />
                        <strong>Description:</strong>{" "}
                        {description[idx]
                          ? description[idx]
                          : "No description available"}
                      </div>
                    ))}
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          ))}
        </div>
      </div>
      <div id="missionQueue">
        <h1 id="missQueueHeader">Mission Queue</h1>
        <DatePicker
          id="datepicker"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
        <button onClick={sendMissionQueueToBackend} id="submitqueue">
          <img
            src={submit}
            alt=""
            style={{
              width: "30px",
              height: "30px",
              // backgroundColor: "black",
            }}
          />
          Submit Queue
        </button>

        {/* below is a dropdown for selecting an operator from a list of selected operators */}
        {/* <select
          value={selectedUser}
          onChange={(event) => {
            {
              handleUserSelection(event);
            }
          }}
        >
          {""}
          <option value="user">Select a user</option>
          {registeredUsers.map((user, index) => (
            <option key={index} value={user}>
              {user}
            </option>
          ))}
        </select> */}

        <div id="missionQueueButtons">
          {missionQueue.map((mission) => (
            <div key={mission.id} className="mission-item">
              <button key={mission.instanceId} className="task-button">
                {mission.name}
              </button>
              x
              <input
                style={{
                  width: "50px",
                  border: "none",
                  borderBottom: "1px solid black",
                }}
                type="number"
                id="queueInput"
                value={mission.inputValue}
                onChange={(e) =>
                  handleInputChange(mission.instanceId, e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionData;
