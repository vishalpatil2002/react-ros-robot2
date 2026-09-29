import React, { Component } from "react";
import Map from "./DashboardComponents/Map";
import BatteryManagement from "./DashboardComponents/BatteryManagement";
import MissionLogs from "./DashboardComponents/MissionLogs";
import DashComponent from "./DashboardComponents/DashComponent";
import MissionQueue from "./DashboardComponents/MissionQueue";
// import ConnectionToRobot from "./DashboardComponents/ConnectionToRobot";
import "../styles/App.css";
function Dashboard({ isMenuOpen }) {
  return (
    <div className="Dashboard-container">
      <React.Fragment>
        <div className="dashboard">

          <div className="top-row">
            <DashComponent />
          </div>

          <div className="middle-row" style={{display:"flex", justifyContent:"space-evenly"}}>
          <Map isMenuOpen={isMenuOpen} className="map" />
          <MissionLogs />
          </div>

          <div className="bottom-row"  style={{display:"flex", justifyContent:"space-evenly"}}>
          <BatteryManagement isMenuOpen={isMenuOpen} />
          <MissionQueue />  
          </div>

        </div>
      </React.Fragment>
    </div>
  );
}
export default Dashboard;
