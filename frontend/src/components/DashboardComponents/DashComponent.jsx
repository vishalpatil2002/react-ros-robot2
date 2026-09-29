import "../../styles/dashboard.css";
import CompletedMissions from "./tile_components/CompletedMissions";

const Component = () => {
  return (
    <div id="dashcomponent">
      <div className="components" id="compoA">
        {" "}
        <CompletedMissions />
      </div>
      <div className="components" id="compoB">
        Component B
      </div>
      <div className="components" id="compoC">
        Component C
      </div>
      <div className="components" id="compoD">
        Component D
      </div>
    </div>
  );
};

export default Component;
