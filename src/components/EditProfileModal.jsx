import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import CheckboxGroup from "./CheckboxGroup";
import airtableServices from "../services/aritableServices";
import styles from "./EditProfileModal.module.css";

const EditProfileModal = ({ profile, onSave, onClose }) => {
  const [editedProfile, setEditedProfile] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEditedProfile({ ...profile });
    setShowModal(true);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name, option, checked) => {
    setEditedProfile((prevProfile) => ({
      ...prevProfile,
      [name]: checked
        ? [...(prevProfile[name] || []), option]
        : (prevProfile[name] || []).filter((item) => item !== option),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedRecords = [
        {
          id: editedProfile.id,
          fields: {
            Profiles: editedProfile.profiles,
            Restrictions: editedProfile.restrictions || [],
          },
        },
      ];
      await airtableServices.updateRecord(updatedRecords);
      onSave(editedProfile);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="profiles">Profile:</label>
            <input
              type="text"
              id="profiles"
              name="profiles"
              value={editedProfile.profiles || ""}
              onChange={handleChange}
              required
            />
            <h3>Dietary Restrictions</h3>
            <CheckboxGroup
              options={["Halal", "Kosher", "Vegan", "Vegetarian"]}
              selectedOptions={editedProfile.restrictions || []}
              onChange={(option, checked) =>
                handleCheckboxChange("restrictions", option, checked)
              }
            />
            <div className={styles.modalButtons}>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default EditProfileModal;
