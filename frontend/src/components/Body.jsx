import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import ManualControl from "./ManualControl";
import MissionControl from "./MissionControl";
import LogsPage from "./diagnostic/log";
import Chart from "./Chart";
import Operatorpanel from "./OperatorComponents/Operatorpanel";
import Missions from "./Missions/Missions.jsx";
import "../styles/App.css";
import Unthauthorized from "../components/Unauthorized";
import Settings from "./settings_component/Settings";
import Setup from "./setupComponents/Setup";
import Unauthorized from "../components/Unauthorized";
import Crypt from "../scripts/cryption";
import Alarm from "./AlarmComponents/Alarm"
import Maintenance from "./PreventivePredective/MaintenanceTab"
function Body({ isMenuOpen, isLauncherOpen }) {
  // const userRole = Crypt.decrypt(localStorage.getItem("role"));

  return (
    <div className="body-container">
      <Routes>
        <Route path="/" exact element={<Dashboard isMenuOpen={isMenuOpen} />} />
        <Route
          path="/manualcontrol"
          exact
          element={<ManualControl />  }
        />
        <Route
          path="/missioncontrol"
          exact
          element={ <MissionControl isMenuOpen={isMenuOpen} />        }
        />
        <Route
          path="logs"
          exact
          element={<LogsPage isMenuOpen={isMenuOpen} />}
        />
        <Route path="chart" exact element={<Chart isMenuOpen={isMenuOpen} />} />
        <Route
          path="Operatorpanel"
          exact
          element={<Operatorpanel isMenuOpen={isMenuOpen} />}
        />
        <Route
          path="Missions"
          exact
          element={              <Missions isMenuOpen={isMenuOpen} />        }
        />
        <Route path="setup" exact element={<Setup />} />
        <Route path="maintenancetask" exact element={<Maintenance />} />

        <Route path="/unauthorized" exact element={<Unauthorized />} />
        <Route
          path="/settings"
          exact
          element={              <Settings />          }
        />

<Route
          path="/alarm"
          exact
          element={              <Alarm />          }
        />
      </Routes>
    </div>
  );
}

export default Body;
