import React, { useEffect, useState } from "react";
import config from "../../scripts/config"
const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ip = config.IP;
  const port = config.PORT;
  
  // Fetch alarms from backend
  const fetchAlarms = () => {
    fetch(`http://${ip}:${port}/api/getAlarms`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Dataaaaaa",data)
        setAlarms(data);
        // setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Error fetching alarms:", error));
  };

  useEffect(() => {
    fetchAlarms();
  }, [page]); 

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      hour12: true,
      timezone: "UTC"
    }) 
    ||
    new Date(date).toLocaleString("en-GB", {timezone: "UTC"});
  }

  return (
    <div>
      <h2>Alarm Section</h2>
      <table border="1" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Sl. No</th>
            <th>Alarm Name</th>
            <th>Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {alarms.map((alarm, index) => (
            <tr key={alarm._id}>
              <td>{ index + 1}</td>
              <td>{alarm.name}</td>
              <td>{alarm.message}</td>
              <td>{formatDate(alarm.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Alarm;
