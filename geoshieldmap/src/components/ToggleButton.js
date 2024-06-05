import React from "react";

const ToggleButton = ({ setToggleState, toggleState }) => {

    const handleChange = () => {
        setToggleState(!toggleState);
      };
  return (
    <div className="button b2" id="button-16">
      <input
        type="checkbox"
        className="checkbox"
        checked={toggleState}
        onChange={handleChange} 
      />
      <div className="knobs"></div>
      <div className="layer"></div>
    </div>
  );
};

export default ToggleButton;