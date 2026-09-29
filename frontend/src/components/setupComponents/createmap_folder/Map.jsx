import React, { useEffect, useState } from "react";
import ROSLIB from "roslib";
import config from "../../../scripts/config";

const webSocketPort = config.WEBSOCKET_PORT;
const port = config.PORT;
const ip = config.IP;

const Map = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const ros = new ROSLIB.Ros({
        url: `ws://${ip}:${webSocketPort}`,
      });

      ros.on("connection", () => {
        console.log("Connected to Ros");
      });

      ros.on("error", (error) => {
        console.log("Error connecting to Ros", error);
      });

      ros.on("close", () => {
        console.log("Disconnected from Ros");
      });

      const listenerForPath = new ROSLIB.Topic({
        ros: ros,
        name: "/move_base/SBPLLatticePlanner/plan",
        messageType: "nav_msgs/Path",
      });

      const movebaseFeedback = new ROSLIB.Topic({
        ros: ros,
        name: "/move_base/feedback",
        messageType: "move_base_msgs/MoveBaseActionFeedback",
      });

      const mapLoad = () => {};

      let operatingMode = "slam";
      const CreatePoseTopic = (operatingMode) => {
        if (operatingMode === "slam") {
          return new ROSLIB.Topic({
            ros: ros,
            name: "/odom",
            messageType: "nav_msgs/Odometry",
          });
        } else if (operatingMode === "nav") {
          return new ROSLIB.Topic({
            ros: ros,
            name: "/amcl_pose",
            messageType: "geometry_msgs/PoseWithCovarianceStamped",
          });
        }
      };
      let PoseTopic = CreatePoseTopic(operatingMode);
      var viewer = new ROS2D.Viewer({
        divID: "map",
        width: 850,
        height: 700,
      });

      const gridClient = new ROS2D.OccupancyGridClient({
        ros: ros,
        rootObject: viewer.scene,
        image: "turtlebot.png",
        continuous: true,
      });

      var robotMarker = new createjs.Container();
      var body = new createjs.Shape();

      body.graphics
        .setStrokeStyle(0.1) // Border width
        .beginStroke("#000000") // Border color
        .beginFill("#2C3E50")
        .drawRoundRect(-0.2, -0.2, 0.9, 0.6, 0.2)
        .endFill();

      var shine = new createjs.Shape();
      shine.graphics
        .beginLinearGradientFill(
          ["rgba(0,255,0,0.5)", "rgba(0,0,255,0.5)"],
          [0, 1],
          -0.2,
          -0.2,
          0.7,
          -0.2
        )
        .drawRoundRect(-0.2, -0.2, 0.9, 0.6, 0.1);

      robotMarker.addChild(body, shine);

      var indicator = new createjs.Shape();
      indicator.graphics
        .beginFill("white")
        .setStrokeStyle(0.02)
        .beginStroke("white")
        .moveTo(0.4, 0)
        .lineTo(0.6, 0.2)
        .lineTo(0.6, -0.2)
        .closePath();
      indicator.rotation = 180;
      indicator.x = 0.9;
      indicator.y = 0.1;

      robotMarker.addChild(indicator);
      robotMarker.alpha = 0.6;
      viewer.scene.addChild(robotMarker);

      var pathShape = new ROS2D.PathShape({
        strokeSize: 0.1,
        strokeColor: createjs.Graphics.getRGB(0, 255, 0, 1),
      });
      gridClient.rootObject.addChild(pathShape);

      listenerForPath.subscribe((message) => {
        if (!message) {
          console.warn("Warning: message is undefined");
          return;
        }
        if (!message.poses || message.poses.length === 0) {
          console.warn("Warning: message.poses is undefined or empty", message);
          // toast.info(`Pose or Message is not defined`);
          return;
        }
        pathShape.setPath(message);
      });

      var traceShape = new ROS2D.TraceShape({
        strokeSize: 0.1,
        strokeColor: createjs.Graphics.getRGB(255, 0, 0, 0.5),
        maxPoses: 25,
      });
      gridClient.rootObject.addChild(traceShape);

      movebaseFeedback.subscribe(function (message) {
        if (
          !message.feedback ||
          !message.feedback.base_position ||
          !message.feedback.base_position.pose
        ) {
          console.warn(
            "Warning: message.feedback.base_position.pose is undefined"
          );
          return;
        }
        traceShape.addPose(message.feedback.base_position.pose);
      });

      window.addEventListener("load", mapLoad);

      const createFunc = (poseTopic, robotMarker, operatingMode) => {
        poseTopic.subscribe((pose) => {
          if (operatingMode === "slam") {

            if (
              pose.pose &&
              pose.pose.pose &&
              pose.pose.pose.position &&
              pose.pose.pose.orientation
            ) {
              const position = pose.pose.pose.position;
              const orientation = pose.pose.pose.orientation;

              robotMarker.x = position.x;
              robotMarker.y = -position.y;

              const { x, y, z, w } = orientation;
              const degree =
                (-Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)) *
                  180.0) /
                Math.PI;
              robotMarker.rotation = degree;
            } else {
              console.warn("Pose data is missing or malformed", pose);
            }
          } else if (operatingMode === "nav") {

            if (
              pose.pose &&
              pose.pose.pose &&
              pose.pose.pose.position &&
              pose.pose.pose.orientation
            ) {
              robotMarker.x = pose.pose.pose.position.x;
              robotMarker.y = -pose.pose.pose.position.y;

              const { w, x, y, z } = pose.pose.pose.orientation;
              const degree =
                (-Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)) *
                  180) /
                Math.PI;
              robotMarker.rotation = degree;
            } else {
              console.warn(
                "Pose data for navigation is missing or malformed",
                pose
              );
            }
          }

          gridClient.rootObject.addChild(robotMarker);
        });
      };

      createFunc(PoseTopic, robotMarker, operatingMode);
      gridClient.on("change", function () {
        viewer.scaleToDimensions(
          gridClient.currentGrid.width,
          gridClient.currentGrid.height
        );
        viewer.shift(
          gridClient.currentGrid.pose.position.x,
          gridClient.currentGrid.pose.position.y
        );
      });

      setInitialized(true);
    }
  }, []);

  return (
    <div className="createMap-container">
      {/* <h4>Here comes a Map</h4> */}
      <div
        id="map-outer"
        style={{
          backgroundColor: "grey",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginLeft: "10px",
          paddingRight: "120px",
          overflow: "hidden",
          width: "800px",
          height: "500px",
          zIndex: 0,
          border: "1px solid grey",
          borderRadius: "20px",
        }}
      >
        <div
          id="map"
          style={{
            width: "750px",
            height: "500px",
            backgroundRepeat: "no-repeat",
            backgroundColor: "grey",
            position: "relative",
            border: "none",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Map;
