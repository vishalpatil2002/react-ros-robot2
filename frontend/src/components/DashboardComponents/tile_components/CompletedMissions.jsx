import { useState, useEffect } from "react";

import config from "../../../scripts/config.js";

const ip = config.IP;
const port = config.PORT;

const CompletedMissions = () => {
  const [completedMissions, setCompletedMissions] = useState(null);
  useEffect(() => {
    fetch(`http://${ip}:${port}/api/completedMissions`)
      .then((res) => res.json())
      .then((data) => {
        setCompletedMissions(data.data);
      })
      .catch((err) => {
        setCompletedMissions(null);
      });
  }, []);

  return (
    <div>
      <p>Missions Completed: {completedMissions}</p>
    </div>
  );
};

export default CompletedMissions;
