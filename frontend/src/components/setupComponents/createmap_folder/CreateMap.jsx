import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Joystick from "./Joystick";
import Map from "./Map";
import Crypt from "../../../scripts/cryption";
import "../../../styles/createMapModal.css";

const CreateMap = ({ show, handleClose }) => {
  const [alertMessageVisible, setAlertMessageVisible] = useState(false);
  const saveMap = async () => {
    const mapName = prompt("Enter map name before proceeding...");
    const userName = Crypt.decrypt(localStorage.getItem("UserName"));
    if (mapName) {
      try {
        const response = await fetch("/save_map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: mapName, user: userName }),
        });
        const data = await response.json();
        alert(data.message);
      } catch (err) {
        console.error("error saving the map", err);
      }
    } else if (!userName) {
      alert("Please login with desired credentials to save the map");
    }
  };

  const terminateProcess = async (processName) => {
    setAlertMessageVisible(true);

    try {
      const response = await fetch(`/terminate/${processName}`, {
        method: "POST",
      });
      const data = await response.json();
      setAlertMessageVisible(false);
      alert(data.message);
      if (processName == "navigation") {
        localStrorage.removeItem("selectedMap");
        localStrorage.removeItem("operatingMode");
      } else if (processName == "slam_gmapping") {
        localStorage.removeItem("operatingMode");
      }
    } catch (err) {
      console.error(`Error terminating the process ${processName} : ${err}`);
    }
  };

  return (
    <Modal
      style={{ widht: "700px" }}
      show={show}
      onHide={() => {
        terminateProcess("slam_gmapping");
        terminateProcess("gazebo");
        handleClose();
      }}
      backdrop="static"
      keyboard={false}
      centered
      // dialogClassName = 'custom-modal'
      className="custom-modal"
      fullscreen
    >
      <Modal.Header closeButton className="modal-container">
        <Modal.Title>Create a map</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-container">
        <div id="modal-body">
          <div>
            <Map />
            <button
              className="modal-button"
              onClick={async () => {
                await saveMap();
                await terminateProcess("slam_gmapping");
                await terminateProcess("gazebo");
                handleClose();
              }}
            >
              Save Map
            </button>
            <button
              className="modal-button"
              onClick={() => {
                terminateProcess("slam_gmapping");
                terminateProcess("gazebo");
                handleClose();
              }}
            >
              Stop Mapping
            </button>
          </div>
          <div className="modal-joystick">
            <Joystick />
          </div>
          {alertMessageVisible && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#000",
                color: "#fff",
                padding: "20px",
                borderRadius: "8px",
                zIndex: "1050",
              }}
            >
              Wait Until The Process Terminates...
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CreateMap;
