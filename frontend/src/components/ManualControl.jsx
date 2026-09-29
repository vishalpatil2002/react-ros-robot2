import React, { Component, useState } from "react";
import ManualMap from "./ ManualComponents/ManualMap";
// import Joystick from "./ ManualComponents/Joystick";
import Captureposition from "./ ManualComponents/Captureposition";
// import ManualJoystick from "./ ManualComponents/ManualJoystick";
import JoystickToggle from "./ ManualComponents/JoystickToggle";
import "../styles/App.css";

function manualcontrol({ isMenuOpen }) {
  const [markerData, setMarkerData] = useState(null);
  return (
    <React.Fragment>
      <div className="manual-row">
        <ManualMap markerData={markerData} />
        {/* <Joystick style={{ marginTop: "300px" }} /> */}
        <JoystickToggle style={{ marginTop: "300px" }} />
      </div>
      <div style={{ marginTop: "40px" }}>
        <Captureposition
          isMenuOpen={isMenuOpen}
          setMarkerData={setMarkerData}
        />
      </div>
      {/* <div className="middle-row" style={{ marginTop: "100px" }}></div> */}
    </React.Fragment>
  );
}

export default manualcontrol;
