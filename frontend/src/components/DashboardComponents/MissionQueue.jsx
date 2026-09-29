import React, { useContext, useEffect, useState } from "react";
import { MissionContext } from "../../context/MissionContext";
import axios from "axios";
import Button from "react-bootstrap/Button";
import io from "socket.io-client";
import config from "../../scripts/config";

const ip = config.IP;
const port = config.PORT;
const socket = io(`http://${ip}:${port}`);

const MissionQueue = () => {
  const { activeMission, activeQueuePosition } = useContext(MissionContext);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [completedPositions, setCompletedPositions] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchMissionData = async (mission) => {
      try {
        const response = await axios.get(`http://${ip}:${port}/api/missionData`);
        const missionData = response.data.find(
          (item) => item.queueData.missionName === mission
        );

        if (missionData) {
          const positionIds = missionData.queueData.queue;

          const tooltipResponse = await axios.post(
            `http://${ip}:${port}/api/missiontoolip`,
            { tooltipMissionName: positionIds }
          );

          setQueue(tooltipResponse.data.searchResults);

          const savedCompleted = JSON.parse(
            localStorage.getItem(`completedPositions_${mission}`)
          ) || [];
          setCompletedPositions(savedCompleted);
        }
      } catch (error) {
        console.error("Error fetching mission data:", error);
      }
    };

    if (activeMission && activeMission !== "No active task") {
      fetchMissionData(activeMission);
    } else {
      setQueue([]);
      setCompletedPositions([]);
      setCurrentIndex(null);
    }
  }, [activeMission]);

  useEffect(() => {
    if (!queue.length) return;
  
    if (activeQueuePosition === "No Active Tasks") {
      const lastIndex = queue.length - 1;
      if (!completedPositions.includes(lastIndex)) {
        setCompletedPositions((prev) => {
          const updated = [...prev, lastIndex];
          localStorage.setItem(
            `completedPositions_${activeMission}`,
            JSON.stringify(updated)
          );
          return updated;
        });
      }
      setCurrentIndex(null);
      return;
    }
  
    const index = queue.findIndex(
      (name) => name.toLowerCase() === activeQueuePosition?.toLowerCase()
    );
    if (index === -1) return;
  
    if (currentIndex !== null && index > currentIndex) {
      if (!completedPositions.includes(currentIndex)) {
        setCompletedPositions((prev) => {
          const updated = [...prev, currentIndex];
          localStorage.setItem(
            `completedPositions_${activeMission}`,
            JSON.stringify(updated)
          );
          return updated;
        });
      }
    }
  
    setCurrentIndex(index);
  }, [activeQueuePosition, queue]);
  

  useEffect(() => {
    const handleStatusUpdate = (data) => {
      setStatus(data.status);
    };

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, []);

  useEffect(() => {
    if (!queue.length || !activeQueuePosition || activeQueuePosition === "No Active Tasks") return;
  
    const index = queue.findIndex(
      (name) => name.toLowerCase() === activeQueuePosition?.toLowerCase()
    );
  
    if (index === 0 && completedPositions.length > 0) {
      console.log(" New mission started, clearing old completed positions");
      setCompletedPositions([]);
      localStorage.removeItem(`completedPositions_${activeMission}`);
    }
  }, [activeQueuePosition, queue]);
  

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
                  lineHeight: "35px",
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
                  lineHeight: "35px",
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
                marginTop: "20px",
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
                      backgroundColor:
                        idx === currentIndex ? "#d4f7d4" : "white",
                      color:
                        idx === currentIndex
                          ? "green"
                          : completedPositions.includes(idx)
                          ? "gray"
                          : "black",
                      fontWeight: idx === currentIndex ? "bold" : "normal",
                    }}
                  >
                    {positionName}
                  </Button>
                  {/* {completedPositions.includes(idx) && (
                    <span style={{ marginLeft: "10px", color: "green" }}>
                      ✔️
                    </span>
                  )} */}
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
