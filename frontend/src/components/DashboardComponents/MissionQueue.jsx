import React, { useContext, useEffect, useState, useRef } from "react";
import { MissionContext } from "../../context/MissionContext";
import axios from "axios";
import Button from "react-bootstrap/Button";
import io from "socket.io-client";
import config from "../../scripts/config";

const ip = config.IP;
const port = config.PORT;
const socket = io(`http://${ip}:${port}`);

const MissionQueue = () => {
  const { activeMission } = useContext(MissionContext);
  const [queue, setQueue] = useState([]); // Holds the list of positions
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0); // Tracks the current position
  const [completedPositions, setCompletedPositions] = useState([]); // Tracks completed positions
  const [abortedPositions, setAbortedPositions] = useState([]); // Tracks aborted positions
  const [status, setStatus] = useState(""); // Tracks mission status
  const isInitialLoad = useRef(true); // Tracks initial load

  // Fetch mission data from the backend
  useEffect(() => {
    const fetchMissionData = async (mission) => {
      try {
        const response = await axios.get(
          `http://${ip}:${port}/api/missionData`
        );
        const missionData = response.data.find(
          (missionItem) => missionItem.queueData.missionName === mission
        );
        if (missionData) {
          const positionIds = missionData.queueData.queue;
          const tooltipResponse = await axios.post(
            `http://${ip}:${port}/api/missiontoolip`,
            { tooltipMissionName: positionIds }
          );
          setQueue(tooltipResponse.data.searchResults); // Set the queue of positions
        }
      } catch (error) {
        console.error("Error fetching mission data:", error);
      }
    };

    if (activeMission && activeMission !== "No active task") {
      fetchMissionData(activeMission);
    } else {
      setQueue([]); // Clear the queue if no mission is active
    }
  }, [activeMission]);

  // Restore states from localStorage when activeMission changes
  useEffect(() => {
    if (
      isInitialLoad.current &&
      activeMission &&
      activeMission !== "No active task"
    ) {
      const savedCurrentIndex =
        JSON.parse(
          localStorage.getItem(`currentPositionIndex_${activeMission}`)
        ) || 0;
      const savedCompleted =
        JSON.parse(
          localStorage.getItem(`completedPositions_${activeMission}`)
        ) || [];
      const savedAborted =
        JSON.parse(localStorage.getItem(`abortedPositions_${activeMission}`)) ||
        [];

      // Ensure completedPositions only includes positions before the currentPositionIndex
      const validCompletedPositions = savedCompleted.filter(
        (index) => index < savedCurrentIndex
      );

      // Log the restored values
      console.log("Restored currentPositionIndex:", savedCurrentIndex);
      console.log(
        "Restored completedPositions (valid):",
        validCompletedPositions
      );
      console.log("Restored abortedPositions:", savedAborted);

      setCurrentPositionIndex(savedCurrentIndex);
      setCompletedPositions(validCompletedPositions);
      setAbortedPositions(savedAborted);

      // Mark initial load as complete
      isInitialLoad.current = false;
    }
  }, [activeMission]);

  // Handle WebSocket updates
  useEffect(() => {
    const handleStatusUpdate = (data) => {
      const newStatus = data.status;
      setStatus(newStatus); // Update the status box
    };

    const handleIndexUpdate = (data) => {
      console.log("WebSocket Data:", data); // Log the WebSocket data
      const newIndex = data.index;
      const previousIndex = currentPositionIndex; // Save the previous index

      // Update the current position index
      setCurrentPositionIndex(newIndex);

      // Mark the previous position as completed
      if (
        previousIndex < newIndex &&
        !completedPositions.includes(previousIndex)
      ) {
        setCompletedPositions((prev) => {
          const updated = [...prev, previousIndex];
          console.log("Completed Positions:", updated); // Log the updated completed positions
          return updated;
        });
      }
    };

    // Set up WebSocket listeners
    socket.on("statusUpdate", handleStatusUpdate);
    socket.on("indexUpdate", handleIndexUpdate);

    // Clean up WebSocket listeners
    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
      socket.off("indexUpdate", handleIndexUpdate);
    };
  }, [currentPositionIndex, completedPositions]);

  // Persist states to localStorage whenever they change
  useEffect(() => {
    if (activeMission && activeMission !== "No active task") {
      localStorage.setItem(
        `currentPositionIndex_${activeMission}`,
        JSON.stringify(currentPositionIndex)
      );
      localStorage.setItem(
        `completedPositions_${activeMission}`,
        JSON.stringify(completedPositions)
      );
      localStorage.setItem(
        `abortedPositions_${activeMission}`,
        JSON.stringify(abortedPositions)
      );
    }
  }, [
    currentPositionIndex,
    completedPositions,
    abortedPositions,
    activeMission,
  ]);

  // Reset everything when the mission is completed
  useEffect(() => {
    if (status === "Completed" && completedPositions.length === queue.length) {
      setCurrentPositionIndex(0);
      setCompletedPositions([]);
      setAbortedPositions([]);
      localStorage.removeItem(`currentPositionIndex_${activeMission}`);
      localStorage.removeItem(`completedPositions_${activeMission}`);
      localStorage.removeItem(`abortedPositions_${activeMission}`);
    }
  }, [status, completedPositions, queue.length, activeMission]);

  return (
    <div
      className="mission-queue-box"
      style={{
        backgroundColor: "white",
        padding: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        marginTop: "15px",
        width: "600px",
        height: "480px",
        border: "1px solid #d4b4a2",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid black",
          textAlign: "center",
          color: "black",
          fontSize: "25px",
          paddingBottom: "10px",
        }}
      >
        Current Mission Queue
      </div>
      <div className="queue-content" style={{ marginTop: "10px" }}>
        {queue.length > 0 ? (
          <>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <label
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  border: "1px dashed black",
                  borderRadius: "20px",
                  width: "250px",
                  height: "35px",
                  textAlign: "center",
                }}
              >
                MISSION: {activeMission}
              </label>
              <p
                style={{
                  marginLeft: "15px",
                  border: "1px dashed black",
                  borderRadius: "5px",
                  width: "200px",
                  textAlign: "center",
                }}
              >
                Total Positions: {queue.length}
              </p>
            </div>

            <div
              style={{
                marginLeft: "80px",
                overflowY: "auto",
                width: "200px",
                height: "220px",
              }}
            >
              {queue.map((positionName, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <Button
                    variant="info"
                    style={{
                      width: "150px",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color:
                        idx === currentPositionIndex
                          ? "green"
                          : idx < currentPositionIndex
                          ? "lightgrey"
                          : "info",
                    }}
                  >
                    {positionName}
                  </Button>
                  {completedPositions.includes(idx) && (
                    <span style={{ marginLeft: "10px", color: "green" }}>
                      ✔️
                    </span>
                  )}
                  {abortedPositions.includes(idx) && (
                    <span style={{ marginLeft: "10px", color: "red" }}>❌</span>
                  )}
                </div>
              ))}
            </div>
            <div
              id="status"
              style={{
                border: "1px solid black",
                width: "150px",
                height: "40px",
                marginLeft: "300px",
                marginBottom: "20px",
                color:
                  status === "Completed"
                    ? "green"
                    : status === "Aborted"
                    ? "red"
                    : "black",
                textAlign: "center",
                lineHeight: "40px",
              }}
            >
              {status}
            </div>
          </>
        ) : (
          <p>No Active Task</p>
        )}
      </div>
    </div>
  );
};

export default MissionQueue;
