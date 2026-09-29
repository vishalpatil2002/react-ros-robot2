import { useState } from "react";
import MapsModel from "./maps_modal/MapsModel";
import Crypt from "../../scripts/cryption";

function Settings() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // fetching user details from local storage
  const userName = Crypt.decrypt(localStorage.getItem("UserName"));
  // const role = Crypt.decrypt(localStorage.getItem("role"));
  const emailId = Crypt.decrypt(localStorage.getItem("Email"));

  return (
    <div>
      <h2>
        User Details{" "}
        <p>
          <span> Edit</span>{" "}
        </p>
      </h2>
      <h4>Name: {userName}</h4>
      {/* <h4>Role: {role}</h4> */}
      <h4>Email Id: {emailId}</h4>
      <hr></hr>
      <h2>Maps</h2>
      <button variant="primary" onClick={handleOpenModal}>
        Delete Maps
      </button>
      <MapsModel show={showModal} handleClose={handleCloseModal} />
    </div>
  );
}

export default Settings;
