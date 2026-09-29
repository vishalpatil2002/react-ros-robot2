import React, { useEffect } from "react";
import { useState } from "react";
import { Bar } from "react-chartjs-2";

const Chart = () => {
  const [dataToDisplay, setDataToDisplay] = useState([]);
  useEffect(() => {
    fetch("http://192.168.0.47:4001/datainfo")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setDataToDisplay(data.message);
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
        // backgroundColor: "rgba(255, 99, 132, 0.2)",
        // borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: " rgba(11, 132, 165, 0.5)",
        borderColor: "rgba(11, 132, 165, 1)",
        data: load,
        fill: false,
      },
      {
        label: "Battery",
        // backgroundColor: "rgba(54, 162, 235, 0.2)",
        // borderColor: "rgba(54, 180, 180, 1)",
        backgroundColor: "rgba(246, 200, 95, 0.5)",
        borderColor: "rgba(246, 200, 95, 1)",
        data: battery,
        fill: false,
      },
      {
        label: "Mileage",
        // backgroundColor: "rgba(75, 192, 192, 0.2)",
        // borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(111, 78, 124, 0.5)",
        borderColor: "rgba(111, 78, 124, 1)",
        data: mileage,
        fill: false,
      },
      {
        label: "Total Distance",
        // backgroundColor: "rgba(44, 255, 99, 0.2)",
        // borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(157, 216, 102, 0.5)",
        borderColor: "rgba(157, 216, 102, 1)",
        data: total_distance,
        fill: false,
      },
    ],
  };
  return (
    <div>
      <h2>Parameters</h2>

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
            {dataToDisplay.map((data) => (
              <tr>
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
    </div>
  );
};

export default Chart;
