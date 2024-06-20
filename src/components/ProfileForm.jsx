import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileForm.module.css";
import CheckboxGroup from "./CheckboxGroup";
import airtableServices from "../services/aritableServices";

const ProfileForm = ({ location }) => {
  const [profiles, setProfiles] = useState("");
  const [restrictions, setRestrictions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (location && location.state && location.state.profile) {
      const { Profiles, Restrictions } = location.state.profile;
      setProfiles(Profiles);
      setRestrictions(Restrictions || []);
    }
  }, [location]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const profile = {
      Profiles: profiles,
      Restrictions: restrictions,
    };

    try {
      let response;
      if (location && location.state && location.state.profile) {
        const { id } = location.state.profile;
        response = await airtableServices.updateRecord(id, profile);
      } else {
        response = await airtableServices.createRecord(profile);
      }

      console.log("Profile saved successfully:", response);
      navigate("/profiles");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (location && location.state && location.state.profile) {
        const { id } = location.state.profile;
        await airtableServices.deleteRecord(id);
        console.log("Profile deleted successfully");
        navigate("/profiles");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
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
        <label htmlFor="profiles">Profile:</label>
        <input
          type="text"
          id="profiles"
          value={profiles}
          onChange={(e) => setProfiles(e.target.value)}
        />
        <h3>Dietary Restrictions</h3>
        <CheckboxGroup
          options={["Halal", "Kosher", "Vegan", "Vegetarian"]}
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
