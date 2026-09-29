// JoystickToggle.js
import React, { useState } from "react";
import Joystick from "./Joystick";
import ManualJoystick from "./ManualJoystick";
import toggle from "../../images/toggle.png";
import "../../styles/JoystickToggle.css";

function JoystickToggle() {
  const [isJoystickEnabled, setIsJoystickEnabled] = useState(true);

  const toggleJoystick = () => {
    setIsJoystickEnabled((prev) => !prev);
  };

  return (
    <div className="toggleButtonContanier">
      <button
        onClick={toggleJoystick}
        className="togglebutton"
        style={{
          color: "#ffffff",
          border: "none",
          height: "40px",
          width: "250px",
          borderRadius: "5px",
        }}
      >
        <img
          src={toggle}
          alt=""
          style={{
            width: "30px",
            // height: "25px",
            marginRight: "15px",
            color: "#E40078",
          }}
        />
        Toggle to {isJoystickEnabled ? "Keypress Joystick" : "Joystick"}
      </button>
      <div style={{ marginTop: "20px" }}>
      {isJoystickEnabled ? <Joystick /> : <ManualJoystick />}

      </div>
    </div>
  );
}

export default JoystickToggle;
