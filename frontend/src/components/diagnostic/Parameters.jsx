import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import config from "../../scripts/config.js";

const ip = config.IP;

const Parameters = () => {
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://${ip}:4001/datainfo`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setDataToDisplay(data.message);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      });
  }, []);

  const labels = dataToDisplay.map((data) => data.date);
  const load = dataToDisplay.map((data) => data["load in kg"]);
  const battery = dataToDisplay.map((data) => data.battery);
  const mileage = dataToDisplay.map((data) => data.mileage);
  const total_distance = dataToDisplay.map(
    (data) => data["total_distance in m"]
  );

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Load",
        backgroundColor: "rgba(11, 132, 165, 0.5)",
        borderColor: "rgba(11, 132, 165, 1)",
        data: load,
        fill: false,
      },
      {
        label: "Battery",
        backgroundColor: "rgba(246, 200, 95, 0.5)",
        borderColor: "rgba(246, 200, 95, 1)",
        data: battery,
        fill: false,
      },
      {
        label: "Mileage",
        backgroundColor: "rgba(111, 78, 124, 0.5)",
        borderColor: "rgba(111, 78, 124, 1)",
        data: mileage,
        fill: false,
      },
      {
        label: "Total Distance",
        backgroundColor: "rgba(157, 216, 102, 0.5)",
        borderColor: "rgba(157, 216, 102, 1)",
        data: total_distance,
        fill: false,
      },
    ],
  };

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Parameters</h2>
      {dataToDisplay.length > 0 ? (
        <>
          <Bar data={data} style={{ width: "1050px" }} />

          <div>
            <table border="1">
              <thead>
                <tr>
                  <th>SL. No</th>
                  <th>Date Time</th>
                  <th>Load</th>
                  <th>Battery</th>
                  <th>Mileage</th>
                  <th>Total Distance in meters</th>
                </tr>
              </thead>
              <tbody>
                {dataToDisplay.map((data, index) => (
                  <tr key={index}>
                    <td>{data._id}</td>
                    <td>{data.date}</td>
                    <td>{data["load in kg"]}</td>
                    <td>{data.battery || "N/A"}</td>
                    <td>{data.mileage || "N/A"}</td>
                    <td>{data["total_distance in m"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default Parameters;
