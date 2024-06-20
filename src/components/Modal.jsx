import React, { useRef, useEffect } from "react";
import styles from "./Modal.module.css";

const Modal = ({ onClose, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div
        ref={modalRef}
        className={styles.modalContent}
        onClick={handleModalClick}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
