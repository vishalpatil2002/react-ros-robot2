import React, { createContext, useState, useEffect } from "react";

export const MissionContext = createContext();

export const MissionProvider = ({ children }) => {
  const [activeMission, setactive] = useState(() => {
    const storedMission = localStorage.getItem("activeMission");
    return storedMission === "Aborted" ? "No active task" : storedMission || "";
  });
  const [activateMission, setActiveMission] = useState(null);
  const [activeQueuePosition, setActiveQueuePosition] = useState(null);

  // For setup screen to add and remove map
  const [selectedMap, setSelectedMapState] = useState(() => {
    return localStorage.getItem("selectedMap") || null;
  });

  const setSelectedMap = (mapName) => {
    setSelectedMapState(mapName);
    if (mapName) {
      localStorage.setItem("selectedMap", mapName);
    } else {
      localStorage.removeItem("selectedMap");
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const mapName = localStorage.getItem("selectedMap");
      setSelectedMapState(mapName || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("activeMission", activeMission);
  }, [activeMission]);

  return (
    <MissionContext.Provider
      value={{
        activeMission,
        setactive,
        activateMission,
        setActiveMission,
        selectedMap,
        setSelectedMap,
        setActiveQueuePosition,
        activeQueuePosition,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};
