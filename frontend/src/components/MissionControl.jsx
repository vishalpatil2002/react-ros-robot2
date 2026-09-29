import React from "react";
import PositionData from "./MissionComponents/PositionData";
import "../styles/MissionControl.css";
const MissionControl = ({ isMenuOpen }) => {
  return (
    <div className="mission-control">
      <PositionData isMenuOpen={isMenuOpen} />
    </div>
  );
};

export default MissionControl;
