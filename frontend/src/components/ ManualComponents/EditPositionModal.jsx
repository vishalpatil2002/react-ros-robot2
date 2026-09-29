import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import "../../styles/modal.css";

function EditPositionModal({
  show,
  handleClose,
  handleSubmit,
  positionName,
  handleInputChange,
  formData,
  setFormData,
}) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className="modal-container">
        <Modal.Title>Edit Position</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-container">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-1" controlId="positionNameInput">
            <div className="label-wrapper">
              <Form.Control
                type="input"
                placeholder="Enter Position Name"
                autoFocus
                value={positionName}
                onChange={handleInputChange}
              />
            </div>
          </Form.Group>
          <Form.Group className="mb-3 row" controlId="xPoseInfo">
            <Form.Label className="col-sm-2 col-form-label">X:</Form.Label>
            <div className="col-sm-10">
              <Form.Control
                type="text"
                value={formData.field1}
                onChange={(e) =>
                  setFormData({ ...formData, field1: e.target.value })
                }
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3 row" controlId="yPoseInfo">
            <Form.Label className="col-sm-2 col-form-label">Y:</Form.Label>
            <div className="col-sm-10">
              <Form.Control
                type="text"
                value={formData.field2}
                onChange={(e) =>
                  setFormData({ ...formData, field2: e.target.value })
                }
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3 row" controlId="zPoseInfo">
            <Form.Label className="col-sm-2 col-form-label">Z:</Form.Label>
            <div className="col-sm-10">
              <Form.Control
                type="text"
                value={formData.field3}
                onChange={(e) =>
                  setFormData({ ...formData, field3: e.target.value })
                }
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3 row" controlId="orientationInfo">
            <Form.Label className="col-sm-2 col-form-label">W:</Form.Label>
            <div className="col-sm-10">
              <Form.Control
                type="text"
                value={formData.field4}
                onChange={(e) =>
                  setFormData({ ...formData, field4: e.target.value })
                }
              />
            </div>
          </Form.Group>

          <Form.Group>
            <button className="modal-button" type="submit">
              Save Changes
            </button>
            <button className="modal-button" onClick={handleClose}>
              Close
            </button>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditPositionModal;
