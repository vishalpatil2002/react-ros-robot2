import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "../styles/Menutree.css";
import Dashboard from "../images/Dashboard.png";
import ManualControl from "../images/ManualControl.png";
import MissionControl from "../images/MissionControl.png";
import programming from "../images/programming.png";
import machine from "../images/machine.png";
import diagnostic from "../images/diagnostic.png";
import setup from "../images/setup.png";
import maintenance from "../images/maintenance.png"
import Crypt from "../scripts/cryption";

const MenuTree = ({ isOpen }) => {
  // const userRole = Crypt.decrypt(localStorage.getItem("role"));
  return (
    <div className={`navcontainer ${isOpen ? "" : "navclose"}`}>
      <nav className="nav" style={{ color: "#4a4a4a" }}>
        <div className="nav-upper-options">
          <div className="nav-option option2">
            <Nav.Link href="/" className={isActive("/") ? "active-link" : ""}>
              <img src={Dashboard} className="nav-img" alt="dashboard" />
              <span style={{ color: "#4a4a4a" }}>Dashboard</span>
            </Nav.Link>
          </div>

            <>
              <div className="nav-option">
                <Nav.Link
                  href="/manualcontrol"
                  className={isActive("/manualcontrol") ? "active-link" : ""}
                >
                  <img
                    src={ManualControl}
                    className="nav-img"
                    alt="manual control"
                  />
                  <span style={{ color: "#4a4a4a" }}>ManualControl</span>
                </Nav.Link>
              </div>
              <div className="nav-option">
                <Nav.Link
                  href="/missioncontrol"
                  className={isActive("/missioncontrol") ? "active-link" : ""}
                >
                  <img
                    src={MissionControl}
                    className="nav-img"
                    alt="mission control"
                  />
                  <span style={{ color: "#4a4a4a" }}>MissionControl</span>
                </Nav.Link>
              </div>
              <div className="nav-option">
                <Nav.Link
                  href="/Missions"
                  className={isActive("/Missions") ? "active-link" : ""}
                >
                  <img src={programming} alt="Missions" className="nav-img" />
                  <span style={{ color: "#4a4a4a" }}>Missions</span>
                </Nav.Link>
              </div>
            </>
          

          <div className="nav-option">
            <Nav.Link
              href="/Operatorpanel"
              className={isActive("/Operatorpanel") ? "active-link" : ""}
            >
              <img src={machine} className="nav-img" alt="Operatorpanel" />
              <span style={{ color: "#4a4a4a" }}>Assigned Tasks</span>
            </Nav.Link>
          </div>
          <div className="nav-option">
            <Nav.Link
              href="/logs"
              className={isActive("/logs") ? "active-link" : ""}
            >
              <img src={diagnostic} className="nav-img" alt="Diagnostics" />
              <span style={{ color: "#4a4a4a" }}>Diagnostics</span>
            </Nav.Link>
          </div>
          <div className="nav-option">
            <Nav.Link
              href="/setup"
              className={isActive("/setup") ? "active-link" : ""}
            >
              <img src={setup} className="nav-img" alt="setup icon" />
              <span style={{ color: "#4a4a4a" }}>Setup</span>
            </Nav.Link>
          </div>
          <div className="nav-option">
            <Nav.Link
              href="/maintenancetask"
              className={isActive("/maintenancetask") ? "active-link" : ""}
            >
              <img src={maintenance} className="nav-img" alt="Maintenance icon" />
              <span style={{ color: "#4a4a4a" }}> Maintenance </span>
            </Nav.Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

const isActive = (path) => {
  const currentPath = window.location.pathname;
  return currentPath === path;
};

export default MenuTree;
