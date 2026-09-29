import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import io from "socket.io-client";
import "../../styles/App.css";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import config from "../../scripts/config";
import Battery from "./BatteryManagement";
import MissionQueue from "./MissionQueue";
import Map from "./Map";
const ip = config.IP;
const port = config.PORT;
const socket = io(`http://${ip}:${port}`);

const parseDate = (dateString) => {
  const [day, month, year, hour, minute, second] = dateString.split(/[-\s:]/);
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
};

const MissionLogs = () => {
  const [missionLogs, setMissionLogs] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("All");

  useEffect(() => {
    const fetchMissionLogs = async () => {
      try {
        const response = await axios.get(
          `http://${ip}:${port}/api/missionHistory`
        );
        console.log('Mission Logs respnse:', response.data)
        if (Array.isArray(response.data)) {
          const sortedLogs = response.data
          .filter(log => typeof log.completionDateTime === "string" && log.completionDateTime.includes(" "))
          .sort((a, b) => {
            const [dateStrA, timeStrA] = a.completionDateTime.split(" ");
            const [dateStrB, timeStrB] = b.completionDateTime.split(" ");
        
            const dateA = new Date(dateStrA.split("-").reverse().join("-") + " " + timeStrA);
            const dateB = new Date(dateStrB.split("-").reverse().join("-") + " " + timeStrB);
        
            return dateB - dateA;
          });
        
          setMissionLogs(sortedLogs);
        } else {
          setMissionLogs([]);
        }
      } catch (error) {
        console.error("Error fetching mission logs:", error);
        setMissionLogs([]);
      }
    };

    fetchMissionLogs();

    return () => {
      socket.off("missionLogs");
    };
  }, []);

  const handleFilterChange = (e) => {
    setFilterText(e.target.value.toLowerCase());
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  const filterLogsByDate = (logs) => {
    const now = new Date();

    return logs.filter((log) => {
      const logDate = parseDate(log.completionDateTime);

      switch (selectedDuration) {
        case "Today":
          const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          return logDate >= startOfToday && logDate <= now;

        case "Last Week":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return logDate >= oneWeekAgo && logDate <= now;

        // case "Last Month":
        //   const startOfThisMonth = new Date(
        //     now.getFullYear(),
        //     now.getMonth(),
        //     1
        //   );
        //   const startOfLastMonth = new Date(
        //     now.getFullYear(),
        //     now.getMonth() - 1,
        //     1
        //   );
        //   const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        //   endOfLastMonth.setHours(23, 59, 59, 999);
        //   return logDate >= startOfLastMonth && logDate <= endOfLastMonth;

        case "Last Month":
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(now.getDate() - 30);
          return logDate >= oneMonthAgo && logDate <= now;
        default:
          return true;
      }
    });
  };

  const filteredLogs = filterLogsByDate(missionLogs).filter((log) => {
    return (
      log.missionName.toLowerCase().includes(filterText) ||
      log.status.toLowerCase().includes(filterText) ||
      log.completionDateTime.toLowerCase().includes(filterText)
    );
  });

  
  const handleDownload = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "SL NO",
      "Mission Name",
      "Status",
      "Completion Date-Time",
    ];
    const tableRows = [];
    filteredLogs.forEach((log, index) => {
      const logData = [
        index + 1,
        log.missionName,
        log.status,
        log.completionDateTime,
      ];
      tableRows.push(logData);
    });

    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save("mission_logs.pdf");
  };
  return (
    // <Tabs>
    //         <TabList>
    //           <Tab>Mission History</Tab>
    //           <Tab>Current Mission Queue</Tab>
    //           <Tab>Map</Tab>
    //           <Tab>Battery Management</Tab>
    //         </TabList>
    //   <TabPanel>
    <div
      className="mission-logs-box"
      style={{
        height: "480px",
        width: "600px",
        // marginLeft: "82px",
        // marginTop:"105px",
        borderRadius:"10px",
        // backgroundColor: "white",
        padding: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        border:"1px solid #d4b4a2"
      }}
    >
      <div
        style={{
          borderBottom: "1px solid black",
          textAlign: "center",
          color: "black",
          fontSize: "25px",
          marginBottom: "10px",
        }}
      >
        Mission History
      </div>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <button
          className="duration"
          onClick={() => handleDurationChange("Today")}
        >
          Today
        </button>
        <button
          className="duration"
          onClick={() => handleDurationChange("Last Week")}
        >
          Last Week
        </button>
        <button
          className="duration"
          onClick={() => handleDurationChange("Last Month")}
        >
          Last Month
        </button>
        <button className="duration" onClick={handleDownload}>
          Export{" "}
        </button>
      </div>
      <div style={{ marginTop: "5px" }}>
        <input
          type="text"
          placeholder="Filter"
          value={filterText}
          onChange={handleFilterChange}
        />
      </div>
      <div
        style={{
          overflowY: "auto",
          height: "300px",
          marginTop: "5px",
        }}
      >
        <table
          style={{
            width: "100%",
            height: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#f1f1f1",
              zIndex: 1,
            }}
          >
            <tr>
              <th style={{ borderBottom: "1px solid black", padding: "10px" }}>
                SL NO
              </th>
              <th style={{ borderBottom: "1px solid black", padding: "10px" }}>
                Mission Name
              </th>
              <th style={{ borderBottom: "1px solid black", padding: "10px" }}>
                Status
              </th>
              <th style={{ borderBottom: "1px solid black", padding: "10px" }}>
                Completion Date-Time
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={log._id}>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "10px" }}>{log.missionName}</td>
                  <td
                    style={{
                      padding: "10px",
                      color:
                        log.status === "Completed"
                          ? "green"
                          : log.status === "Aborted"
                          ? "red"
                          : "black",
                    }}
                  >
                    {log.status}
                  </td>

                  <td style={{ padding: "10px" }}>{log.completionDateTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No mission logs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    // </TabPanel>
    //   <TabPanel>
    //     <MissionQueue />
    //   </TabPanel>
    //   <TabPanel>
    //     <Map/>
    //   </TabPanel>
    //   <TabPanel>
    //     <Battery />
    //   </TabPanel>
    // </Tabs>
  );
};

export default MissionLogs;
