import React, { useEffect, useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";

const MapsModel = ({ show, handleClose }) => {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchMaps = async () => {
      try {
        const response = await fetch("/maps", { signal });
        const data = await response.json();
        setMaps(data);
      } catch (err) {
        if (err.name == "AbortError") {
          console.log("fetch aborted");
        } else {
          console.error("Error fetching maps", err);
        }
      }
    };

    fetchMaps();

    return () => {
      abortController.abort();
    };
  }, []);

  const updateMaps = async () => {
    try {
      const response = await fetch("/maps");
      const data = await response.json();
      setMaps(data);
    } catch (err) {
      console.error("Error fetching maps", err);
    }
  };

  const handleDelete = async (mapName) => {
    if (
      mapName &&
      window.confirm("Are you sure you want to delete this map?")
    ) {
      try {
        const response = await fetch("/delete_map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: mapName }),
        });
        const data = await response.json();
        if (data.success) {
          alert("Map deleted Successfully!!");
          updateMaps();
        } else {
          alert("Failed to delete map!");
        }
      } catch (err) {
        console.error(`Error deleting the map! ${err}`);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Maps List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {maps.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Map Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((mapName, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{mapName}</td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(mapName)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No maps available</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MapsModel;
