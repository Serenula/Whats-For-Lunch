import React, { useState, useEffect } from "react";
import styles from "./EditProfileModal.module.css";

const EditProfileModal = ({ profile, onSave, onClose }) => {
  const [profileName, setProfileName] = useState(profile.name);
  const [allergies, setAllergies] = useState(profile.allergies || []);
  const [restrictions, setRestrictions] = useState(profile.restrictions || []);

  useEffect(() => {
    setProfileName(profile.name);
    setAllergies(profile.allergies || []);
    setRestrictions(profile.restrictions || []);
  }, [profile]);

  const handleSave = () => {
    const updatedProfile = {
      name: profileName,
      allergies,
      restrictions,
    };
    console.log("Save button clicked, updatedProfile:", updatedProfile);
    onSave(updatedProfile);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit Profile</h2>
        <form>
          <label htmlFor="profileName">Profile Name:</label>
          <input
            type="text"
            id="profileName"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <h3>Allergies</h3>
          <CheckboxGroup
            options={[
              "Nuts",
              "Crustaceans",
              "Gluten",
              "Mushrooms",
              "Dairy",
              "Eggs",
              "Soy",
            ]}
            selectedOptions={allergies}
            onChange={(option, checked) => {
              setAllergies((prevAllergies) =>
                checked
                  ? [...prevAllergies, option]
                  : prevAllergies.filter((a) => a !== option)
              );
            }}
          />
          <h3>Dietary Restrictions</h3>
          <CheckboxGroup
            options={[
              "Halal",
              "Kosher",
              "Keto",
              "Vegan",
              "Vegetarian",
              "Pescatarian",
              "Hindu/Buddhist",
            ]}
            selectedOptions={restrictions}
            onChange={(option, checked) => {
              setRestrictions((prevRestrictions) =>
                checked
                  ? [...prevRestrictions, option]
                  : prevRestrictions.filter((r) => r !== option)
              );
            }}
          />
        </form>
        <button type="button" onClick={handleSave}>
          Save
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const CheckboxGroup = ({ options, selectedOptions, onChange }) => (
  <div className={styles.checkboxGroup}>
    {options.map((option) => (
      <label key={option}>
        <input
          type="checkbox"
          checked={selectedOptions.includes(option)}
          onChange={(e) => onChange(option, e.target.checked)}
        />
        {option}
      </label>
    ))}
  </div>
);

export default EditProfileModal;
