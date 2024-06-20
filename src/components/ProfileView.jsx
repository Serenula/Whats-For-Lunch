import React, { useState, useEffect } from "react";
import styles from "./ProfileView.module.css";
import airtableServices from "../services/aritableServices";
import EditProfileModal from "./EditProfileModal";
import Maps from "./Maps";

const ProfileView = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const fetchedProfiles = await airtableServices.getRecords();
      setProfiles(fetchedProfiles.records);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await airtableServices.deleteRecord(profileId);
      console.log("Profile deleted successfully");
      fetchProfiles();
      if (selectedProfile && selectedProfile.id === profileId) {
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleEditProfile = (profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (editedProfile) => {
    try {
      const updatedProfile = {
        profiles: editedProfile.profiles,
        restrictions: editedProfile.restrictions || [],
      };

      await airtableServices.updateRecord(selectedProfile.id, updatedProfile);

      setIsModalOpen(false);
      setSelectedProfile(null);
      console.log("Profile updated successfully");
      fetchProfiles();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const selectProfile = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className={styles.profileViewContainer}>
      <div className={styles.profileList}>
        <h2>Profiles</h2>
        {profiles && profiles.length > 0 ? (
          <ul className={styles.profileList}>
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className={`${styles.profileListItem} ${
                  selectedProfile && selectedProfile.id === profile.id
                    ? styles.selectedProfile
                    : ""
                }`}
                onClick={() => selectProfile(profile)}
              >
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>
                    {profile.fields && profile.fields.Profiles}
                  </span>
                  <div className={styles.profileDetails}>
                    <p>
                      <strong>Restrictions:</strong>{" "}
                      {profile.fields && profile.fields.Restrictions
                        ? profile.fields.Restrictions.join(", ")
                        : "None"}
                    </p>
                    <div className={styles.buttonsContainer}>
                      <button
                        className={styles.editButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProfile(profile);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProfile(profile.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No profiles found.</p>
        )}
      </div>

      {selectedProfile && (
        <div className={styles.mapsContainer}>
          <h3>Selected Profile: {selectedProfile.fields.Profiles}</h3>
          <Maps restrictions={selectedProfile.fields.Restrictions || []} />
        </div>
      )}

      {isModalOpen && selectedProfile && (
        <EditProfileModal
          profile={selectedProfile}
          onSave={handleSaveProfile}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ProfileView;
