import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import Alert from "react-bootstrap/Alert";
import ROSLIB from "roslib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import capture from "../../images/capture.png";
import "../../styles/App.css";
import "../../styles/modal.css";
import EditPositionModal from "./EditPositionModal";
import axios from "axios";
import config from "../../scripts/config";

const webSocketPort = config.WEBSOCKET_PORT;
const ip = config.IP;
const port = config.PORT;

function Example({ isMenuOpen, setMarkerData }) {
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [capturePositionName, setCapturePositionName] = useState("");
  const [editPositionName, setEditPositionName] = useState("");
  const [buttonNames, setButtonNames] = useState([
    "Docking",
    "Lift-Toplet",
    "Drop-Toplet",
    "Wait",
  ]);
  const [buttonIds, setButtonIds] = useState([]);
  const [editButtonId, setEditButtonId] = useState(null);
  const [formData, setFormData] = useState({});
  const [positions, setPositions] = useState([]);
  const [latestPosition, setLatestPosition] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [receivedData, setReceivedData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [Description, setDescription] = useState();
  const [showMarker, setShowMarker] = useState(false);
  const [markerVisibility, setMarkerVisibility] = useState({});

  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: `ws://${ip}:${webSocketPort}`,
    });

    ros.on("connection", () => {
      console.log("Connected to ROS");
    });

    ros.on("error", (error) => {
      console.error("Error connecting to ROS:", error);
    });

    ros.on("close", () => {
      console.log("Disconnected from ROS");
    });

    const poseTopic = new ROSLIB.Topic({
      ros,
      name: "/amcl_pose",
      messageType: "geometry_msgs/PoseWithCovarianceStamped",
    });

    poseTopic.subscribe((msg) => {
      setLatestPosition(msg);
      setPositions((prevPositions) => [...prevPositions, msg]);
    });

    // Fetch data from your backend
    fetch(`http://${ip}:${port}/api/data`)
      .then((response) => response.json())
      .then((data) => {
        setReceivedData(data);
        setButtonNames(data.map((item) => item.name));
        setButtonIds(data.map((item) => item._id));
      })
      .catch((error) => console.error("Error fetching data:", error));
    const savedVisibility = localStorage.getItem("markerVisibility");
    if (savedVisibility) {
      setMarkerVisibility(JSON.parse(savedVisibility));
    }
    return () => {
      poseTopic.unsubscribe();
      // ros.close();
    };
  }, []);

  const handleCloseCaptureModal = () => {
    setShowCaptureModal(false);
  };
  const sendUserNameToBackend = async (mapName) => {
    try {
      const url = `http://${ip}:${port}/api/sendUserName`;
      await axios.post(url, { mapName });
    } catch (error) {
      console.error("Error sending UserName:", error);
    }
  };

  const mapName = localStorage.getItem("selectedMaps");
  console.log("mapname", mapName)
  sendUserNameToBackend(mapName);

  const handleShowCaptureModal = () => {
    // Update formData with the latest position
    if (latestPosition.pose && latestPosition.pose.pose) {
      setFormData({
        field1: latestPosition.pose.pose.position.x,
        field2: latestPosition.pose.pose.position.y,
        field3: latestPosition.pose.pose.position.z,
        field4: latestPosition.pose.pose.orientation.w,
      });
    }
    setShowCaptureModal(true);
  };

  const handleCaptureInputChange = (e) => {
    setCapturePositionName(e.target.value);
  };
  const handleDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleCaptureSubmit = (e) => {
    e.preventDefault();
    const lowerCaseCaptureName = capturePositionName.toLowerCase();

    if (
      buttonNames.some((name) => name.toLowerCase() === lowerCaseCaptureName)
    ) {
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else {
      setButtonNames((prevButtonNames) => [
        ...prevButtonNames,
        capturePositionName,
      ]);
      setPositions((prevPositions) => [
        ...prevPositions,
        { name: capturePositionName, ...latestPosition },
      ]);
      sendPositionData(capturePositionName, latestPosition);
      setCapturePositionName("");
      handleCloseCaptureModal();
    }
  };

  const handleEdit = async (id, name) => {
    const confirmEdit = window.confirm(
      `Do you want to edit position with ID '${name}'?`
    );
    if (confirmEdit) {
      try {
        const response = await fetch(`http://${ip}:${port}/api/positionData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          const positionData = await response.json();

          setFormData({
            field1: positionData.amclData.pose.pose.position.x,
            field2: positionData.amclData.pose.pose.position.y,
            field3: positionData.amclData.pose.pose.position.z,
            field4: positionData.amclData.pose.pose.orientation.w,
          });
          setEditPositionName(positionData.name); // Assuming positionData contains the name
          setEditButtonId(id); // Set the ID of the button being edited
          setShowEditModal(true);
        } else {
          console.error("Failed to fetch position data:", response.statusText);
        }
      } catch (error) {
        console.error("Error editing position:", error);
      }
    }
  };

  const handleEditInputChange = (e) => {
    setEditPositionName(e.target.value);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://${ip}:${port}/api/updatePositionData`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editButtonId,
            name: editPositionName,
            amclData: {
              field1: formData.field1,
              field2: formData.field2,
              field3: formData.field3,
              field4: formData.field4,
            },
          }),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setToastMessage(`successfully Edited '${editPositionName}' `);
        setShowToast(true);
      } else {
        console.error("Failed to update position data:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const handleDelete = async (name) => {
    if (window.confirm(`Do you want to delete '${name}'?`)) {
      try {
        const response = await fetch(`http://${ip}:${port}/api/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
        if (response.ok) {
          setButtonNames((prevButtonNames) =>
            prevButtonNames.filter((buttonName) => buttonName !== name)
          );
          setToastMessage(`Deleted '${name}' successfully`);
          setShowToast(true);
        } else {
          console.error("Failed to delete:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleShowMarker = (name) => {
    // setMarkerData(data);
    localStorage.setItem("PositionName", name);
    const visibility = localStorage.getItem("markerVisibility");
    const parsedVisibility = JSON.parse(visibility);
    setShowMarker(!showMarker);
    if (showMarker && parsedVisibility) {
      localStorage.removeItem("PositionName");
    }
  };
  const toggleMarkerVisibility = (buttonId) => {
    setMarkerVisibility((prevState) => {
      const updatedVisibility = {
        ...prevState,
        [buttonId]: !prevState[buttonId],
      };
      localStorage.setItem(
        "markerVisibility",
        JSON.stringify(updatedVisibility)
      );

      return updatedVisibility;
    });
  };
  const sendPositionData = (positionName, amclData) => {
    const url = `http://${ip}:${port}/save`;

    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        positionName: positionName,
        amclData: amclData,
        Description: Description,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json();
          setToastMessage(
            `${positionName} successfully inserted into database`
          );
          setShowToast(true);
        }
      })
      .catch((error) => {
        console.error("Error sending data:", error);
      });
  };

  return (
    <>
      <Button onClick={handleShowCaptureModal} id="capture">
        <img
          src={capture}
          alt=""
          style={{
            width: "30px",
            // height: "25px",
            marginRight: "15px",
            color: "#E40078",
          }}
        />
        <span>Capture Position</span>
      </Button>

      <Modal show={showCaptureModal} onHide={handleCloseCaptureModal}>
        <Modal.Header className="modal-container" closeButton>
          <Modal.Title>Taurus position capturing</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-container">
          <Form onSubmit={handleCaptureSubmit}>
            <Form.Group className="mb-1" controlId="positionNameInput">
              <Form.Control
                type="input"
                placeholder="Enter Position Name"
                autoFocus
                value={capturePositionName}
                onChange={handleCaptureInputChange}
                maxLength={20}
              />
            </Form.Group>
            <Form.Group>
              <textarea
                name="Description Box"
                id=""
                cols="45"
                rows="3"
                placeholder="Enter Brief Description..."
                onChange={handleDescription}
              ></textarea>
            </Form.Group>
            <Form.Group className="mb-3" controlId="xPoseInfo">
              <Form.Label>X: {formData.field1}</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3" controlId="yPoseInfo">
              <Form.Label>Y: {formData.field2}</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3" controlId="zPoseInfo">
              <Form.Label>Z: {formData.field3}</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3" controlId="orientationInfo">
              <Form.Label>W: {formData.field4}</Form.Label>
            </Form.Group>
            <Form.Group>
              <button className="modal-button" type="submit">
                Submit
              </button>
              <button
                className="modal-button"
                type="button"
                onClick={handleCloseCaptureModal}
              >
                Close
              </button>
            </Form.Group>
          </Form>
        </Modal.Body>
        {/* Alert for duplicate name */}
        {showAlert && (
          <Alert
            variant="warning"
            className="alert"
            onClose={() => setShowAlert(false)}
            dismissible
          >
            Position name '{capturePositionName}' already exists.
          </Alert>
        )}
      </Modal>

      {/* Edit Position Modal */}
      <EditPositionModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        handleSubmit={handleEditSubmit}
        positionName={editPositionName}
        handleInputChange={handleEditInputChange}
        formData={formData}
        setFormData={setFormData}
      />

      {/* Display buttons from received data and new submissions */}
      {/* <div
        className="received-buttons"
        style={{
          border: "1px solid #d4b4a2",
          boxShadow:
            "0px 4px 6px rgba(212, 161, 133, 0.6), 0px 0px 10px rgba(212, 161, 133, 0.3)",
          borderRadius: "15px",
          width: isMenuOpen ? "73vw" : "90vw",
          maxHeight: "250px",
          // height: "250px",
          position: "relative",
          top: "90px",
          left: "70px",
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {buttonNames.length > 0 ? (
          buttonNames.map((name, index) => (
            <div
              id={buttonIds[index]} // Use buttonId directly here
              style={{
                width: "100%",
                maxHeight: "68px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                backgroundColor: "#d6d2d0",
                color: "#2a2a2a",
                boxShadow: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #d4b4a2",
                padding: "0",
                borderRadius: "5px",
                cursor: "alias",
              }}
              key={index}
              className="pos-buttons"
             
            >
              <span style={{ marginLeft: "25px" }}> {name}</span>
              <div>
                <button
                  variant="link"
                  className="edit"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the parent button's onClick from firing
                    handleEdit(buttonIds[index], name);
                  }}
                  style={{
                    // borderleft: "1px solid #88b0f0",
                    // borderLeft: "1px solid  #4c80d4",
                    // borderRight: "1px solid black",
                    // borderRadius: "5px",
                    marginRight: "30px",
                    height: "68px",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: "transparent",
                    // boxShadow: "1px 1px 3px 1px  #6f75cd",
                    // backgroundColor: "#c5dbff",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faEdit}
                    style={{ fontSize: "1.5em" }}
                  />
                </button>
                <button
                  variant="link"
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(name);
                  }}
                  style={{
                    // borderLeft: "1px solid  #4c80d4",
                    // borderRight: "1px solid black",
                    // backgroundColor: "#c5dbff",
                    marginRight: "30px",

                    height: "68px",
                    border: "none",
                    backgroundColor: "transparent",

                    // marginLeft: "5px",
                    // boxShadow: "1px 1px 3px 1px  #6f75cd",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ fontSize: "1.5em" }}
                  />
                </button>
                <button
                  variant="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowMarker(name);
                    toggleMarkerVisibility(buttonIds[index]);
                  }}
                  style={{
                    // borderLeft: "1px solid #4c80d4",
                    // backgroundColor: "#c5dbff",
                    marginRight: "30px",

                    height: "68px",
                    border: "none",
                    backgroundColor: "transparent",

                    // marginLeft: "10px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      markerVisibility[buttonIds[index]] ? faEyeSlash : faEye
                    }
                  />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No data available</p>
        )}
      </div> */}

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header>
            {/* <strong className="me-auto">Successfully Inserted into DB</strong> */}
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Example;
