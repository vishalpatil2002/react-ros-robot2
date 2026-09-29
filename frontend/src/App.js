import React, { useState } from "react";
import Header from "./components/Header";
import Body from "./components/Body";
import MenuTree from "./components/MenuTree";
import { MissionProvider } from "./context/MissionContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import PrivateRoute from "./components/PrivateRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./styles/App.css";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLaunchers = () => {
    setLauncherOpen((prev) => {
      const newState = !prev;
      const bodyElement = document.querySelector(".body-container");
      if (bodyElement) {
        bodyElement.style.marginTop = newState ? "-92px" : "0";
      }
      return newState;
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    const bodyElement = document.querySelector(".body-container");
    if (bodyElement) {
      bodyElement.style.marginLeft = isMenuOpen ? "0" : "250px";
    }

  };

  const token = localStorage.getItem("token");

  return (
    <MissionProvider>
      <Router>
        <div className="App">
          {token && (
            <>
              <Header
                toggleMenu={toggleMenu}
                toggleLaunchers={toggleLaunchers}
              />
              <MenuTree isOpen={isMenuOpen} />
            </>
          )}
          <div
            className={`body-container ${isMenuOpen ? "menu-open" : ""} `}
          >
            <Routes>
              {!token ? (
                <>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate replace to="/login" />} />
                </>
              ) : (
                <>
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <Body
                          isMenuOpen={isMenuOpen}
                        />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<Navigate replace to="/login" />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      </Router>
    </MissionProvider>
  );
}

export default App;
