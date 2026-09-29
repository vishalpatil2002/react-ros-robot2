import React, { Component } from "react";
import Linechart from "./ChartComponents/LineChart";

import "../styles/App.css";
function Chart({ isMenuOpen }) {
  return (
    <React.Fragment>
      <div className="manual-row">
        <Linechart />

        {/* <PieChart style={{ marginTop: "300px" }} /> */}
      </div>
      {/* <div style={{ marginTop: "40px" }}>
                <BarChart isMenuOpen={isMenuOpen} />
            </div> */}
    </React.Fragment>
  );
}
export default Chart;
