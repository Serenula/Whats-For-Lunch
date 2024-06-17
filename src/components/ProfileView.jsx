import React, { useState, useEffect } from "react";
import styles from "./ProfileView.module.css";
import EditProfileModal from "./EditProfileModal";

const ProfileView = () => {
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);

  useEffect(() => {
    // Fetch profiles from localStorage
    const savedProfiles = JSON.parse(localStorage.getItem("profiles")) || [];
    setProfiles(savedProfiles);
    console.log("Loaded profiles from localStorage:", savedProfiles);
  }, []);

  const handleDeleteProfile = (profileName) => {
    // Filter out the deleted profile and update the state
    const updatedProfiles = profiles.filter(
      (profile) => profile.name !== profileName
    );
    setProfiles(updatedProfiles);
    // Update localStorage to remove the deleted profile
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
  };

  const handleSaveProfile = (editedProfile) => {
    const updatedProfiles = profiles.map((profile) =>
      profile.name === editingProfile.name ? editedProfile : profile
    );
    console.log("Updated profiles before setting state:", updatedProfiles);
    setProfiles(updatedProfiles);
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
    setEditingProfile(null);
  };

  const handleSelectProfile = (profile) => {
    setSelectedProfiles((prevSelected) =>
      prevSelected.includes(profile)
        ? prevSelected.filter((p) => p !== profile)
        : [...prevSelected, profile]
    );
  };

  const handleCloseModal = () => {
    setEditingProfile(null);
  };

  return (
    <div>
      <h2>Profiles</h2>
      {profiles.length === 0 ? (
        <p>No profiles found.</p>
      ) : (
        <ul className={styles.profileList}>
          {profiles.map((profile) => (
            <li key={profile.name} className={styles.profileListItem}>
              <div className={styles.profileInfo}>
                <input
                  type="checkbox"
                  onChange={() => handleSelectProfile(profile)}
                  checked={selectedProfiles.includes(profile)}
                />
                <span className={styles.profileName}>{profile.name}</span>
                <div className={styles.profileDetails}>
                  <p>Allergies: {profile.allergies.join(", ")}</p>
                  <p>Dietary Restrictions: {profile.restrictions.join(", ")}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteProfile(profile.name)}
                className={styles.deleteButton}
              >
                Delete
              </button>
              <button
                onClick={() => handleEditProfile(profile)}
                className={styles.editButton}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProfileView;
