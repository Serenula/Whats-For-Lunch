import React from "react";

const CheckboxGroup = ({ options, selectedOptions, onChange }) => {
  const handleCheckboxChange = (option, isChecked) => {
    onChange(option, isChecked);
  };

  return (
    <div>
      {options.map((option) => (
        <div key={option}>
          <label>
            <input
              type="checkbox"
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
            />
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckboxGroup;
