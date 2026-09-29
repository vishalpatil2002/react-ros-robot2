import React, { useState, useEffect } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "../../styles/logs.css";
import Parameters from "./Parameters";
import Diagnostics from "./Diagnostics";
import config from "../../scripts/config.js";

const ip = config.IP;
const port = config.PORT;

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://${ip}:${port}/api/logs`);
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = Array.isArray(filteredLogs)
  ? filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  : [];
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const handleFilter = (e) => {
    setFilterQuery(e.target.value);
    const filtered = logs.filter(
      (log) =>
        log.userName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        log.event.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setCurrentPage(1);
    setFilteredLogs(filtered);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginationButtons = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      hour12: true,
      timezone: "UTC"
    }) 
    ||
    new Date(date).toLocaleString("en-GB", {timezone: "UTC"});
  }

  return (
    <Tabs>
      {/* TabList contains the tabs */}
      <TabList>
        <Tab>User History</Tab>
        <Tab>Taurus History</Tab>
        <Tab>Taurus Parameters</Tab>
      </TabList>

      {/* TabPanel contains the content for each tab */}
      <TabPanel>
        <div className="logsmain">
          <h1 id="logtitle">User History</h1>

          {/* Filter input */}
          <div className="filter">
            <input
              type="text"
              placeholder="Filter by user or event..."
              value={filterQuery}
              onChange={handleFilter}
            />
            <h3 id="view">View</h3>
            <select value={rowsPerPage} onChange={handleRowsChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
            </select>
          </div>

          {/* Logs Table */}
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Event</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.userName}</td>
                  <td>{log.role}</td>
                  <td>{log.event}</td>
                  <td>{formatDate(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {getPaginationButtons().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={currentPage === pageNumber ? "active" : ""}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </TabPanel>

      <TabPanel>
        <Diagnostics />
      </TabPanel>

      <TabPanel>
        <Parameters />
      </TabPanel>
    </Tabs>
  );
};

export default LogsPage;
