import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./ProfileForm.module.css";
import CheckboxGroup from "./CheckboxGroup";

const ProfileForm = () => {
  const [profileName, setProfileName] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location && location.state && location.state.profile) {
      const { name, allergies, restrictions } = location.state.profile;
      setProfileName(name);
      setAllergies(allergies);
      setRestrictions(restrictions);
    }
  }, [location]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const profile = {
      name: profileName,
      allergies,
      restrictions,
    };

    const existingProfiles = JSON.parse(localStorage.getItem("profiles")) || [];
    const profileIndex = existingProfiles.findIndex(
      (p) => p.name === profile.name
    );

    if (profileIndex > -1) {
      existingProfiles[profileIndex] = profile;
    } else {
      existingProfiles.push(profile);
    }

    localStorage.setItem("profiles", JSON.stringify(existingProfiles));

    navigate("/profiles");
  };

  const handleDelete = () => {
    const existingProfiles = JSON.parse(localStorage.getItem("profiles")) || [];
    const updatedProfiles = existingProfiles.filter(
      (profile) => profile.name !== profileName
    );

    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
    navigate("/profiles");
  };

  return (
    <div className={styles.profileForm}>
      <h2>
        {location && location.state && location.state.profile
          ? "Edit Profile"
          : "Create Profile"}
      </h2>
      {location && location.state && location.state.profile && (
        <button onClick={handleDelete}>Delete</button>
      )}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default ProfileForm;
