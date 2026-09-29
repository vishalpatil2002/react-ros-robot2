import React, { useEffect, useState } from "react";
import ROSLIB, { Topic } from "roslib";
import _ from "lodash";
import "../../styles/styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import zoomout from "../../images/zoomout.png";
import image from "../../images/zoomin.png";
import config from "../../scripts/config";

const webSocketPort = config.WEBSOCKET_PORT;
const ip = config.IP;
const port = config.PORT;

const ManualMap = ({ }) => {
  const [isInitialPoseChecked, setIsInitialPoseChecked] = useState(false);
  const [isGoalPoseChecked, setIsGoalPoseChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [markerData, setMarkerData] = useState([]);


  const handleInitialPoseToggle =  () => {
    setIsInitialPoseChecked(!isInitialPoseChecked);
    setIsGoalPoseChecked(false);
  };

  const handleGoalPoseToggle = () => {
    setIsGoalPoseChecked(!isGoalPoseChecked);
    setIsInitialPoseChecked(false);
  };

  // useEffect(() => {
  //   fetchPositionNameData();
  // }, []);

  // useEffect(() => {
  //   if (markerData && markerData.amclData?.pose) {
  //     createpositionMarker(markerData);
  //   } else {
  //   }
  // }, [markerData]);

  useEffect(() => {
    if (!initialized) {
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

      const fetchPositionNameData = async () => {
        const Position_Name = localStorage.getItem("PositionName");
        if (Position_Name) {
          try {
            const response = await fetch(
              `http://${ip}:${port}/api/PositionNameData`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ Position_Name }),
              }
            );
            if (response.ok) {
              const data = await response.json();
              // setMarkerData(data);
              const position = data.amclData.pose.pose.position;
              const orientation = data.amclData.pose.pose.orientation;
              const marker = createMarker(position, orientation);
              viewer.scene.addChild(marker);
            }
          } catch (error) {
            console.error(
              `Error Fetching Data for Position Name  : ${Position_Name} `,
              error
            );
          }
        } else {
          setMarkerData([]);
        }
      };
      fetchPositionNameData();

      function createpositionMarker(markerData) {
        if (!markerData || !markerData.amclData?.pose?.pose?.position) {
          console.error("Invalid marker data:", markerData);
          return;
        }
        const robotMarker = new createjs.Container();

        // Create the body of the robot marker
        const body = new createjs.Shape();
        body.graphics
          .setStrokeStyle(0.1) // Border width
          .beginStroke("#000000") // Border color
          .beginFill("#2C3E50")
          .drawRoundRect(-0.2, -0.2, 0.9, 0.6, 0.2)
          .endFill();

        // Create shine effect
        const shine = new createjs.Shape();
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

        // Add body and shine to the robot marker
        robotMarker.addChild(body, shine);

        // Create the indicator
        const indicator = new createjs.Shape();
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

        // Add indicator to the robot marker
        robotMarker.addChild(indicator);
        robotMarker.alpha = 0.6;

        robotMarker.x = markerData.amclData.pose.pose.position.x;
        robotMarker.y = markerData.amclData.pose.pose.position.y;
        // Add the robot marker to the viewer scene
        viewer.scene.addChild(robotMarker);
        return robotMarker;
      }

      if (markerData && markerData.amclData?.pose) {
        createpositionMarker(markerData);
      } else {
      }

      async function receivePoseData() {
        try {
          const response = await fetch(`http://${ip}:${port}/api/poseData`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to receive pose data");
          }

          const data = await response.json();

          const poseDataArray = data.poseData;

          if (Array.isArray(poseDataArray)) {
            poseDataArray.forEach((poseData) => {
              const position = poseData.pose.pose.position;
              const orientation = poseData.pose.pose.orientation;

              const marker = createMarker(position, orientation);

              viewer.scene.addChild(marker);
            });
          } else {
            console.error("Received pose data is not an array:", poseDataArray);
          }
        } catch (error) {
          console.error("Error receiving pose data:", error);
        }
      }

      function createMarker(position, orientation) {
        const robotMarker = new createjs.Container();

        const body = new createjs.Shape();
        body.graphics
          .setStrokeStyle(0.1)
          .beginStroke("#000000")
          .beginFill("#2C3E50")
          .drawRoundRect(-0.2, -0.2, 0.9, 0.6, 0.2)
          .endFill();

        const shine = new createjs.Shape();
        shine.graphics
          .beginLinearGradientFill(
            ["rgba(255, 165, 0, 1)", "rgba(255, 0, 0, 1)"],
            [0, 1],
            -0.2,
            -0.2,
            0.7,
            -0.2
          )
          .drawRoundRect(-0.2, -0.2, 0.9, 0.6, 0.1);

        robotMarker.addChild(body, shine);

        const indicator = new createjs.Shape();
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

        robotMarker.x = position.x;
        robotMarker.y = -position.y;

        const yaw = Math.atan2(
          2 * (orientation.w * orientation.z + orientation.x * orientation.y),
          1 -
          2 * (orientation.y * orientation.y + orientation.z * orientation.z)
        );
        robotMarker.rotation = -yaw * (180 / Math.PI);

        return robotMarker;
      }
      // receivePoseData();
      const storedPausedBtnText = localStorage.getItem("pausedBtnText");
      if (
        storedPausedBtnText === "Playing" ||
        storedPausedBtnText === "Paused"
      ) {
        receivePoseData();
      }
      const navDiv = document.getElementById("map");
      if (navDiv) {
        navDiv.innerHTML = "";
      }
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

      const laserTopic = new ROSLIB.Topic({
        ros: ros,
        name: "/scan",
        messageType: "sensor_msgs/LaserScan",
      });

      const tfClientRef = new ROSLIB.TFClient({
        ros: ros,
        angularThres: 0.01,
        transThres: 0.01,
        rate: 10.0,
      });
      const mapLoad = () => { };

      // let operatingMode = localStorage.getItem('operatingMode');
      let operatingMode = "nav";
      const CreatePoseTopic = (operatingMode) => {
        if (operatingMode === "slam") {
          return new ROSLIB.Topic({
            ros: ros,
            name: "/odom",
            messageType: "nav_msgs/Odometry",
            // name: "/tf",
            // messageType: "tf2_msgs/TFMessage",
            // test versioning
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
        width: 650,
        height: 500,
      });
 
     const gridClient = new ROS2D.OccupancyGridClient({
        ros: ros,
        rootObject: viewer.scene,
        continuous: true,
      });
    //  new ROS2D.OccupancyGridClient({
    //   ros:ros,
    //   rootObject:viewer.scene,
    //   topic:'move_base/local_costmap/costmap',
    //   continuous:true,
    //  })
     new ROS2D.OccupancyGridClient({
      ros:ros,
      rootObject:viewer.scene,
      topic:'/map2',
      continuous:true,
     })


      // let robotMarker = new ROS2D.ArrowShape({
      //   size: 2.0,
      //   strokeSize: 0.05,
      //   pulse: false,
      //   fillColor: createjs.Graphics.getRGB(255, 0, 0, 0.9),
      // });
      var robotMarker = new createjs.Container();

      var body = new createjs.Shape();

      // Draw the rounded rectangle with border radius
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

      // Draw the indicator
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

      // create initial Pose Topic and msg
      const creatInitialPose = (pose_x, pose_y, orientation) => {
        const initialPose = new ROSLIB.Topic({
          ros: ros,
          name: "/initialpose",
          messageType: "geometry_msgs/PoseWithCovarianceStamped",
        });

        var posestamped_msg = new ROSLIB.Message({
          header: {
            stamp: {
              secs: 0,
              nsecs: 100,
            },
            frame_id: "map",
          },
          pose: {
            pose: {
              position: {
                x: pose_x,
                y: pose_y,
                z: 0.0,
              },
              orientation: orientation,
            },
            covariance: [
              0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0,
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.06853892326654787,
            ],
          },
        });
        initialPose.publish(posestamped_msg);
      };
      // create Goal Pose Topic and msg
      const creatGoalPose = (pose_x, pose_y, orientation) => {
        const goalPose = new ROSLIB.Topic({
          ros: ros,
          name: "/move_base_simple/goal",
          messageType: "geometry_msgs/PoseStamped",
        });

        var posestamped_msg = new ROSLIB.Message({
          header: {
            stamp: {
              secs: 0,
              nsecs: 100,
            },
            frame_id: "map",
          },
          pose: {
            position: {
              x: pose_x,
              y: pose_y,
              z: 0.0,
            },
            orientation: orientation,
          },
        });
        goalPose.publish(posestamped_msg);
      };

      const mapContainer = document.getElementById("map");
      if (!mapContainer) {
        console.error("Map container not found.");
        return;
      } else {
        const scale = 30;
        const updateLaserData = (message) => {
          let canvas = document.querySelector(".laser-canvas");

          if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.setAttribute("class", "laser-canvas");
            canvas.style.position = "absolute"; // Ensure proper positioning
            canvas.style.top = "0"; // Adjust top position
            canvas.style.left = "0"; // Adjust left position
            mapContainer.appendChild(canvas);
          }

          canvas.width = mapContainer.clientWidth;
          canvas.height = mapContainer.clientHeight;

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = "red";
          ctx.lineWidth = 0.5;

          for (let i = 0; i < message.ranges.length; i++) {
            const range = message.ranges[i];
            if (range < message.range_max) {
              const angle = message.angle_min + i * message.angle_increment;
              const x = range * Math.cos(angle) * scale + canvas.width / 2;
              const y = -range * Math.sin(angle) * scale + canvas.height / 2;
              if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
          }

          ctx.stroke();
        };
        // laserTopic.subscribe(updateLaserData);
      }

      window.addEventListener("load", mapLoad);

      let mouseDown = false;
      let mouseDownPose = {};
      let mouseDownPosition;
      let mouseDownPositionVec3;
      let mouseUpPosition;
      let mouseUpPositionVec3;
      let xDelta;
      let yDelta;
      let thetaRadians;
      let thetaDegrees;
      const mouseEventHandler = (event, mouseState, operMode) => {
        event.preventDefault();
        if (mouseState === "down") {
          mouseDown = true;
          mouseDownPosition = viewer.scene.globalToRos(
            event.stageX,
            event.stageY
          );
          mouseDownPositionVec3 = new ROSLIB.Vector3(mouseDownPosition);
          mouseDownPose = new ROSLIB.Pose({
            position: new ROSLIB.Vector3(mouseDownPositionVec3),
          });
        } else if (mouseState === "move" && mouseDown) {
          gridClient.rootObject.removeChild(robotMarker);
        } else if (mouseState === "up" && mouseDown) {
          mouseDown = false;
          mouseUpPosition = viewer.scene.globalToRos(
            event.stageX,
            event.stageY
          );
          mouseUpPositionVec3 = new ROSLIB.Vector3(mouseUpPosition);
          const mouseUpPose = new ROSLIB.Pose({
            position: new ROSLIB.Vector3(mouseUpPositionVec3),
          });

          xDelta = mouseUpPose.position.x - mouseDownPose.position.x;
          yDelta = mouseUpPose.position.y - mouseDownPose.position.y;

          thetaRadians = Math.atan2(xDelta, yDelta);

          thetaDegrees = thetaRadians * (180.0 / Math.PI);

          thetaRadians >= 0 && thetaRadians <= Math.PI
            ? (thetaRadians += (3 * Math.PI) / 2)
            : (thetaRadians -= Math.PI / 2);

          var qz = Math.sin(-thetaRadians / 2.0);
          var qw = Math.cos(-thetaRadians / 2.0);
          var orientation = new ROSLIB.Quaternion({ x: 0, y: 0, z: qz, w: qw });

          operMode == "initial"
            ? creatInitialPose(
              mouseDownPose.position.x,
              mouseDownPose.position.y,
              orientation
            )
            : operMode == "goal"
              ? creatGoalPose(
                mouseDownPose.position.x,
                mouseDownPose.position.y,
                orientation
              )
              : null;
        }
      };
      const handleMouseDown = (event) => {
        event.preventDefault();
        let initialPoseChecked =
          document.querySelector("#initialPoseswitch").checked;
        // let goalPoseChecked = document.querySelector("#goalPoseswitch").checked;
        let operMode = initialPoseChecked ? "initial" : "goal";
        if (initialPoseChecked) {
          // document.querySelector("#goalPoseswitch").checked = false;
          mouseEventHandler(event, "down", operMode);
        }
        // if (goalPoseChecked) {
        //   document.querySelector("#initialPoseswitch").checked = false;
        //   mouseEventHandler(event, "down", operMode);
        // }
      };

      const handleMouseMove = (event) => {
        // event.preventDefault();
        let initialPoseChecked =
          document.querySelector("#initialPoseswitch").checked;
        // let goalPoseChecked = document.querySelector("#goalPoseswitch").checked;
        let operMode = initialPoseChecked ? "initial" : "goal";
        if (initialPoseChecked) {
          // document.querySelector("#goalPoseswitch").checked = false;
          mouseEventHandler(event, "move", operMode);
        }
        // if (goalPoseChecked) {
        //   document.querySelector("#initialPoseswitch").checked = false;
        //   mouseEventHandler(event, "move", operMode);
        // }
      };

      const handleMouseUp = (event) => {
        event.preventDefault();
        let initialPoseChecked =
          document.querySelector("#initialPoseswitch").checked;
        // let goalPoseChecked = document.querySelector("#goalPoseswitch").checked;
        let operMode = initialPoseChecked ? "initial" : "goal";
        if (initialPoseChecked) {
          // document.querySelector("#goalPoseswitch").checked = false;
          mouseEventHandler(event, "up", operMode);
        }
        // if (goalPoseChecked) {
        //   document.querySelector("#initialPoseswitch").checked = false;
        //   mouseEventHandler(event, "up", operMode);
        // }
      };

      // Attach event listeners
      viewer.scene.addEventListener("stagemousedown", handleMouseDown);
      viewer.scene.addEventListener("stagemousemove", handleMouseMove);
      viewer.scene.addEventListener("stagemouseup", handleMouseUp);
      const createFunc = (
        handlerToCall,
        discriminator,
        robotMarker,
        operatingMode
      ) => {
        return discriminator.subscribe(function (pose) {
          if (operatingMode == "slam") {
            // let odomPose = pose.transforms[0].transform.translation;
            // let baseLinkPose = pose.transforms[1].transform.translation;
            // let quaZ = pose.transforms[1].transform.rotation.z;

            // robotMarker.x = baseLinkPose.x;
            // robotMarker.y = -baseLinkPose.y;

            // let degreeZ = 0;
            // if (quaZ >= 0) {
            //   degreeZ = (quaZ / 1) * 180;
            // } else {
            //   degreeZ = (-quaZ / 1) * 180 + 180;
            // }
            // robotMarker.rotation = degreeZ;
            var x = pose.pose.pose.position.x;
            var y = pose.pose.pose.position.y;

            var qx = pose.pose.pose.orientation.x;
            var qy = pose.pose.pose.orientation.y;
            var qz = pose.pose.pose.orientation.z;
            var qw = pose.pose.pose.orientation.w;

            var siny_cosp = 2 * (qw * qz + qx * qy);
            var cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
            var yaw = Math.atan2(siny_cosp, cosy_cosp);

            var angle = yaw * (180 / Math.PI);

            robotMarker.x = x;
            robotMarker.y = -y;
            robotMarker.rotation = -angle;
          } else if (operatingMode == "nav") {
            robotMarker.x = pose.pose.pose.position.x;
            robotMarker.y = -pose.pose.pose.position.y;

            let orientationQuerter = pose.pose.pose.orientation;
            var q0 = orientationQuerter.w;
            var q1 = orientationQuerter.x;
            var q2 = orientationQuerter.y;
            var q3 = orientationQuerter.z;
            var degree =
              (-Math.atan2(
                2 * (q0 * q3 + q1 * q2),
                1 - 2 * (q2 * q2 + q3 * q3)
              ) *
                180.0) /
              Math.PI;
            robotMarker.rotation = degree;
          }

          gridClient.rootObject.addChild(robotMarker);
        });
      };

      createFunc("subscribe", PoseTopic, robotMarker, operatingMode);
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

      // The below code is for scroll, zoom-in , zoom-out

      console.log("set initial pose", isInitialPoseChecked);
      let isPanning = false;
      let startX = 0;
      let startY = 0;
      let currentTranslateX = 0;
      let currentTranslateY = 0;
      let initialDistance = null;
      let pinchStartScale = 1;
      let newcurrentScale = 1; // Initialize scale

      const mapOuter = document.getElementById("map-outer");
      const map = document.getElementById("map");

      // Restrict panning within bounds
      function getPanBounds() {
        const outerRect = mapOuter.getBoundingClientRect();
        const mapRect = map.getBoundingClientRect();

        const maxTranslateX =
          (mapRect.width * newcurrentScale - outerRect.width) / 2;
        const maxTranslateY =
          (mapRect.height * newcurrentScale - outerRect.height) / 2;

        return {
          minX: -maxTranslateX,
          maxX: maxTranslateX,
          minY: -maxTranslateY,
          maxY: maxTranslateY,
        };
      }

      // Handle touch gestures
      function getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      if (mapOuter) {
        // Panning with mouse
        mapOuter.addEventListener("mousedown", (event) => {
          let initialPoseChecked =
            document.querySelector("#initialPoseswitch").checked;
          if (!initialPoseChecked) {
            console.log("check initial pose", initialPoseChecked);
            isPanning = true;
            console.log("panning", isPanning);
            startX = event.clientX;
            startY = event.clientY;
            mapOuter.style.cursor = "grab";
          }
        });

        mapOuter.addEventListener("mousemove", (event) => {
          let initialPoseChecked =
            document.querySelector("#initialPoseswitch").checked;
          if (isPanning && !initialPoseChecked) {
            console.log("panning event in mouse move", isPanning);
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            currentTranslateX += dx;
            currentTranslateY += dy;

            const bounds = getPanBounds();
            currentTranslateX = Math.min(
              Math.max(currentTranslateX, bounds.minX),
              bounds.maxX
            );
            currentTranslateY = Math.min(
              Math.max(currentTranslateY, bounds.minY),
              bounds.maxY
            );

            map.style.transform = `scale(${newcurrentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;

            startX = event.clientX;
            startY = event.clientY;
          }
        });

        mapOuter.addEventListener("mouseup", () => {
          isPanning = false;
          mapOuter.style.cursor = "default";
        });

        mapOuter.addEventListener("mouseleave", () => {
          isPanning = false;
        });

        // Panning with touch
        mapOuter.addEventListener("touchstart", (event) => {
          let initialPoseChecked =
            document.querySelector("#initialPoseswitch").checked;
          if (!initialPoseChecked) {
            if (event.touches.length === 1) {
              isPanning = true;
              startX = event.touches[0].clientX;
              startY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
              isPanning = false;
              initialDistance = getDistance(event.touches);
              pinchStartScale = newcurrentScale;
            }
          }
        });

        mapOuter.addEventListener("touchmove", (event) => {
          event.preventDefault();
          let initialPoseChecked =
            document.querySelector("#initialPoseswitch").checked;
          if (!initialPoseChecked) {
            if (event.touches.length === 1 && isPanning) {
              const dx = event.touches[0].clientX - startX;
              const dy = event.touches[0].clientY - startY;

              currentTranslateX += dx;
              currentTranslateY += dy;

              const bounds = getPanBounds();
              currentTranslateX = Math.min(
                Math.max(currentTranslateX, bounds.minX),
                bounds.maxX
              );
              currentTranslateY = Math.min(
                Math.max(currentTranslateY, bounds.minY),
                bounds.maxY
              );

              map.style.transform = `scale(${newcurrentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;

              startX = event.touches[0].clientX;
              startY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
              const currentDistance = getDistance(event.touches);
              const scaleDelta = currentDistance / initialDistance;

              let newScale = pinchStartScale * scaleDelta;
              newScale = Math.min(Math.max(newScale, 0.5), 2); // Restrict zoom level

              newcurrentScale = newScale;
              map.style.transform = `scale(${newcurrentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
            }
          }
        });

        mapOuter.addEventListener("touchend", () => {
          isPanning = false;
          initialDistance = null;
        });

        mapOuter.addEventListener("touchcancel", () => {
          isPanning = false;
          initialDistance = null;
        });
      }

      // Zoom controls
      function zoom(zoomAmount) {
        const newScale = newcurrentScale + zoomAmount;
        if (newScale >= 0.5 && newScale <= 2) {
          newcurrentScale = newScale;
          map.style.transform = `scale(${newcurrentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
        }
      }

      function fitMap() {
        newcurrentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        map.style.transform = `scale(${newcurrentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
      }

      // Zoom buttons
      const zoomInButton = document.getElementById("zoomin");
      const zoomOutButton = document.getElementById("zoomout");
      const fitButton = document.getElementById("fit");

      if (zoomInButton) zoomInButton.addEventListener("click", () => zoom(0.1));
      if (zoomOutButton)
        zoomOutButton.addEventListener("click", () => zoom(-0.1));
      if (fitButton) fitButton.addEventListener("click", fitMap);

      // Mouse wheel zoom
      function handleMouseWheel(event) {
        event.preventDefault();
        const zoomIntensity = 0.1;
        zoom(event.deltaY < 0 ? zoomIntensity : -zoomIntensity);
      }

      if (mapOuter) {
        mapOuter.addEventListener("wheel", handleMouseWheel);
      }

      // return () => {
      //   listenerForPath.unsubscribe();
      //   movebaseFeedback.unsubscribe();
      //   laserTopic.unsubscribe();
      //   viewer.scene.removeEventListener("stagemousedown", handleMouseDown);
      //   viewer.scene.removeEventListener("stagemousemove", handleMouseMove);
      //   viewer.scene.removeEventListener("stagemouseup", handleMouseUp);
      //   if (zoomInButton && zoomOutButton) {
      //     zoomInButton.removeEventListener("click", handleZoomIn);
      //     zoomOutButton.removeEventListener("click", handleZoomOut);
      //   }

      //   if (fitButton) {
      //     fitButton.removeEventListener("click", fitMap);
      //   }
      //   if (mapOuter) {
      //     mapOuter.removeEventListener("wheel", handleMouseWheel);
      //   }
      //   window.removeEventListener("load", mapLoad);
      // };
      // Unsubscribe from tfClient if it's properly initialized
      if (tfClientRef.current) {
        tfClientRef.current.unsubscribe();
      }
      setInitialized(true);
    }
  }, [markerData]);
  let newcurrentScale = 1;




  return (
    <div
      style={{
        width: "620px",
        height: "400px",
      }}
    >
      <ToastContainer
        className="toast-container"
        autoClose={1000}
        toastStyle={{
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "16px",
          padding: "16px",
        }}
      />
      <div
        style={{
          textAlign: "center",
          color: "black",
        }}
      ></div>
      <div
        id="buttons"
        style={{
          marginLeft: "0.2%",
          width: "618px",
          backgroundColor: "rgb(179, 179, 179)",
        }}
      >
        {/* Zoom in button */}
        <button id="zoomin" style={{ width: "80px" }}>
          <img
            src={image}
            className="icn2 menuicn"
            id="playmission"
            alt="zoomIn-icon"
            style={{ width: "20px", height: "20px" }}
          />
        </button>
        {/* Zoom out button */}
        <button id="zoomout" style={{ width: "80px" }}>
          <img
            src={zoomout}
            className="icn2 menuicn"
            id="playmission"
            alt="zoomOut-icon"
            style={{ width: "20px", height: "20px" }}
          />
        </button>
        {/* Fit button */}
        <button id="fit" style={{ width: "80px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="22"
            viewBox="0 0 24 24"
            width="22"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M17 4h3c1.1 0 2 .9 2 2v2h-2V6h-3V4zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v2h2zm16 8v2h-3v2h3c1.1 0 2-.9 2-2v-2h-2zM7 18H4v-2H2v2c0 1.1.9 2 2 2h3v-2zM18 8H6v8h12V8z" />
          </svg>
        </button>
      </div>
      <div
        id="map-outer"
        style={{
          backgroundColor: "grey",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          // marginLeft: "10px",
          paddingRight: "120px",
          overflow: "hidden",
          width: "618px",
          height: "331px",
          zIndex: 0,
        }}
      >
        <div
          id="map"
          style={{
            width: "650px",
            height: "500px",
            backgroundRepeat: "no-repeat",
            backgroundColor: "grey",
            position: "relative",
            border: "none",
          }}
        ></div>
        {/* <div
          id="nav"
          style={{
            width: "800px",
            height: "20px",
            backgroundRepeat: "no-repeat",
            backgroundColor: "grey",
            position: "relative",
          }}
        ></div> */}
        <div
          id="alerts"
          style={{
            width: "800px",
            height: "20px",
            backgroundRepeat: "no-repeat",
            backgroundColor: "grey",
            position: "relative",
          }}
        ></div>
      </div>
      <div
        className="wrapper"
        style={{
          width: "100%",
          height: "150px",
          textAlign: "center",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="poseWrapper">
          <h5>Current Orientation</h5>
          <input
            type="checkbox"
            id="initialPoseswitch"
            style={{
              position: "relative",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
            checked={isInitialPoseChecked}
            onChange={handleInitialPoseToggle}
          />
          <label
            htmlFor="initialPoseswitch"
            className="switch_label"
            style={{
              position: "relative",
              cursor: "pointer",
              display: "inline-block",
              width: "58px",
              height: "28px",
              background: isInitialPoseChecked ? "#c44" : "#fff",
              border: isInitialPoseChecked
                ? "2px solid #c44"
                : "2px solid #daa",
              borderRadius: "20px",
              transition: "0.2s",
            }}
          >
            <span
              className="onf_btn"
              style={{
                position: "absolute",
                top: "2px",
                left: isInitialPoseChecked ? "34px" : "3px",
                display: "inline-block",
                width: "20px",
                height: "20px",
                borderRadius: "20px",
                background: isInitialPoseChecked ? "#fff" : "#daa",
                transition: "0.2s",
                boxShadow: "1px 2px 3px #00000020",
              }}
            ></span>
          </label>
        </div>

        {/* <div className="poseWrapper">
          <h1>Goal Pose</h1>
          <input
            type="checkbox"
            id="goalPoseswitch"
            style={{
              position: "absolute",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
            checked={isGoalPoseChecked}
            onChange={handleGoalPoseToggle}
          />
          <label
            htmlFor="goalPoseswitch"
            className="switch_label"
            style={{
              position: "relative",
              cursor: "pointer",
              display: "inline-block",
              width: "58px",
              height: "28px",
              background: isGoalPoseChecked ? "blue" : "#fff",
              border: isGoalPoseChecked ? "2px solid blue" : "2px solid #daa",
              borderRadius: "20px",
              transition: "0.2s",
            }}
          >
            <span
              className="onf_btn"
              style={{
                position: "absolute",
                top: "2px",
                left: isGoalPoseChecked ? "34px" : "3px",
                display: "inline-block",
                width: "20px",
                height: "20px",
                borderRadius: "20px",
                background: isGoalPoseChecked ? "#fff" : "#daa",
                transition: "0.2s",
                boxShadow: "1px 2px 3px #00000020",
              }}
            ></span>
          </label>
        </div> */}
      </div>
    </div>
  );
};

export default ManualMap;
