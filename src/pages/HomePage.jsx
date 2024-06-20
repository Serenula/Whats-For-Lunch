import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.buttonsContainer}>
        <Link to="/form" className={styles.button}>
          Create Profile
        </Link>
        <Link to="/profiles" className={styles.button}>
          Use Current Profile
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
