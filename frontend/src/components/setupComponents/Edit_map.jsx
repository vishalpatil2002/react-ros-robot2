import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import "../../styles/EditMapModal.css";
import zoomout from "../../images/zoomout.png"
import image from "../../images/zoomin.png";
import pencil from "../../images/pencil.png";
import eraser from "../../images/eraser.png";
import scroll from "../../images/scrolling.png";
import line from "../../images/line.png";
import undo1 from "../../images/undo.png";
import redo1 from "../../images/redo.png";

const EditMap = ({ showEdit, EditHandleClose }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [containerReady, setContainerReady] = useState(false);
  const [currentTool, setCurrentTool] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [selectedMap, setSelectedMap] = useState("");
  const [availableMaps, setAvailableMaps] = useState([]);
  const [lineStart, setLineStart] = useState(null);
  const [scale, setScale] = useState(1);
  const [originalSize, setOriginalSize] = useState({ width: 700, height: 500 });

  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Fetch available maps
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch("/maps");
        const data = await response.json();
        setAvailableMaps(data);
      } catch (error) {
        console.error("Error fetching maps:", error);
        setAvailableMaps([]);
      }
    };
    fetchMaps();
  }, []);
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const getTouchPos = (touch) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  let lastTouchDistance = null;

  const getTouchDistance = (touches) => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      lastTouchDistance = getTouchDistance(e.touches);
      return;
    }

    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const pos = getTouchPos(touch);

    if (currentTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    } else {
      saveHistory();
      setIsDrawing(true);
      setLastPosition(pos);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault(); // Prevent scroll/zoom behavior

      const newDistance = getTouchDistance(e.touches);
      if (lastTouchDistance) {
        const zoomFactor = newDistance / lastTouchDistance;
        setScale((prev) => {
          const newScale = Math.max(1, Math.min(5, prev * zoomFactor));
          return newScale;
        });
      }
      lastTouchDistance = newDistance;
      return;
    }

    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const pos = getTouchPos(touch);

    if (currentTool === "pan" && isPanning) {
      const newX = touch.clientX - panStart.x;
      const newY = touch.clientY - panStart.y;
      setPanOffset({ x: newX, y: newY });
      return;
    }

    if (!isDrawing) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = currentTool === "pencil" ? "#000000" : "#FFFFFF";

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setLastPosition(pos);
  };

  const handleTouchEnd = (e) => {
    setIsDrawing(false);
    setIsPanning(false);

    if (e.touches.length < 2) {
      lastTouchDistance = null;
    }
  };

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd);

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
  };
}, [
  currentTool,
  isDrawing,
  isPanning,
  panOffset,
  panStart,
  lastPosition,
  setScale,
]);


  // Load selected map onto canvas
  useEffect(() => {
    if (!selectedMap) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = imageRef.current;

    image.src = `/get_map_image/${selectedMap}`;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      setOriginalSize({ width: image.width, height: image.height });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [selectedMap]);


  useEffect(() => {
    if (mapContainerRef.current) {
      setContainerReady(true);
    }
  }, [selectedMap]);

  useEffect(() => {
    if (!containerReady || !mapContainerRef.current) return;

    const container = mapContainerRef.current;
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.1;
      if (e.deltaY < 0) {
        setScale((prev) => Math.min(prev + zoomFactor, 3));
      } else {
        setScale((prev) => Math.max(prev - zoomFactor, 1));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [containerReady]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, imageData]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const startDrawing = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (currentTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else if (currentTool === "line") {
      if (!lineStart) {
        setLineStart({ x, y });
      } else {
        saveHistory();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        setLineStart(null);
      }
    } else {
      saveHistory()
      setIsDrawing(true);
      setLastPosition({ x, y });
    }
  };

  const draw = (e) => {
    if (currentTool === "pan" && isPanning) {
      const newX = e.clientX - panStart.x;
      const newY = e.clientY - panStart.y;
      setPanOffset({ x: newX, y: newY });
      return;
    }

    if (!isDrawing || currentTool === "line") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = currentTool === "pencil" ? "#000000" : "#FFFFFF";

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    setLastPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };
  const undo = () => {
    if (history.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const newHistory = [...history];
    const lastState = newHistory.pop();
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(newHistory);
    setRedoStack(prev => [...prev, currentImageData]);
    ctx.putImageData(lastState, 0, 0);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const newRedoStack = [...redoStack];
    const redoState = newRedoStack.pop();
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setRedoStack(newRedoStack);
    setHistory(prev => [...prev, currentImageData]);
    ctx.putImageData(redoState, 0, 0);
  };


  const saveEditedImage = async () => {
    const editedMapName = prompt("Press ok map name will save automatically with version",selectedMap);
    if (!editedMapName) return;

    const canvas = canvasRef.current;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    const mapImage = imageRef.current;

    tempCanvas.width = mapImage.width;
    tempCanvas.height = mapImage.height;
    tempCtx.drawImage(mapImage, 0, 0, mapImage.width, mapImage.height);
    tempCtx.drawImage(canvas, 0, 0);

    const mergedImageData = tempCanvas.toDataURL("image/png");
    try {
      const response = await fetch("/save_edited_map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedMapName, image: mergedImageData }),
      });
      const data = await response.json();
      alert(data.success ? "Edited map saved successfully." : `Error: ${data.message}`);
    } catch (error) {
      console.error("Error saving edited map:", error);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 1));
  };

  const fitToScreen = () => {
    const container = document.querySelector(".map-container");
    const ratioW = container.clientWidth / originalSize.width;
    const ratioH = container.clientHeight / originalSize.height;
    const scaleToFit = Math.min(ratioW, ratioH);
    setScale(scaleToFit);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <Modal
      show={showEdit}
      onHide={EditHandleClose}
      backdrop="static"
      keyboard={false}
      centered
      className="custom-modal"
      fullscreen
    >
      <Modal.Header closeButton className="modal-container">
        <Modal.Title>Edit Map</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-container">
        <div id="modal-body">
          {/* Left section: Canvas and Toolbar */}
          <div className="left-section">
            <div className="toolbar">
              <button
                className={currentTool === "pencil" ? "active" : ""}
                onClick={() => setCurrentTool("pencil")}
              >
                <img
                  src={pencil}
                  alt="pencil"
                  style={{ width: "20px", height: "20px", }}
                />
              </button>
              <button
                className={currentTool === "eraser" ? "active" : ""}
                onClick={() => setCurrentTool("eraser")}
              >
                <img
                  src={eraser}
                  alt="eraser"
                  style={{ width: "20px", height: "20px", }}
                />
              </button>
              <button
                className={currentTool === "line" ? "active" : ""}
                onClick={() => {
                  setCurrentTool("line");
                  setLineStart(null);
                }}
              >
                <img
                  src={line}
                  alt="line"
                  style={{ width: "20px", height: "20px", }}
                />
              </button>
              <button
                className={currentTool === "pan" ? "active" : ""}
                onClick={() => setCurrentTool("pan")}
              >
                <img
                  src={scroll}
                  alt="zoomIn"
                  style={{ width: "20px", height: "20px", }}
                />
              </button>
              <button onClick={zoomIn}>  <img
                src={image}
                alt="zoomIn"
                style={{ width: "20px", height: "20px", }}
              />


              </button>
              <button onClick={zoomOut}>  <img
                src={zoomout}
                alt="zoomOut"
                style={{ width: "20px", height: "20px", }}
              /></button>
              <button onClick={fitToScreen}>              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="22"
                viewBox="0 0 24 24"
                width="22"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M17 4h3c1.1 0 2 .9 2 2v2h-2V6h-3V4zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v2h2zm16 8v2h-3v2h3c1.1 0 2-.9 2-2v-2h-2zM7 18H4v-2H2v2c0 1.1.9 2 2 2h3v-2zM18 8H6v8h12V8z" />
              </svg></button>
              <button onClick={undo}><img src={undo1} alt="undo" style={{ width: "20px", height: "20px", }} /></button>
              <button onClick={redo}><img src={redo1} alt="redo" style={{ width: "20px", height: "20px", }} /></button>
            </div>

            <div
              className="map-container"
              ref={mapContainerRef}
              style={{ position: "relative", overflow: "hidden" }}
            >
              {selectedMap && (
                <>
                  <img
                    ref={imageRef}
                    alt="Map"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                      transformOrigin: "center center",
                      touchAction: "none",
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                      transformOrigin: "center center",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      border: "1px solid #000",
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right section: Dropdown */}
          <div className="right-section">
            <select
              id="mapSelect"
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
            >
              <option value="">-- Select a map --</option>
              {availableMaps.length > 0 ? (
                availableMaps.map((mapName, index) => (
                  <option key={index} value={mapName}>
                    {mapName}
                  </option>
                ))
              ) : (
                <option disabled>No maps available</option>
              )}
            </select>
            <button onClick={saveEditedImage} style={{
              marginRight: "40px",
              backgroundColor: "#d4a185",
              border: "none",
              padding: "5px 10px",
              borderRadius: "8px",
              color: "rgb(41, 39, 39)",
              cursor: "pointer",
              transition: "background-color 0.3s ease"
            }}
            >Save</button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditMap;