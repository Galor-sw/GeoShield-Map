import React from "react";

// ToggleButton component to switch between two states
const ToggleButton = ({ setToggleState, toggleState }) => {

    // Handler function to toggle the state
    const handleChange = () => {
        setToggleState(!toggleState); // Toggle the state value
    };

    return (
        <div className="button b2" id="button-16">
            {/* Input checkbox for the toggle button */}
            <input
                type="checkbox" // Type of input is checkbox
                className="checkbox" // Class name for styling the checkbox
                checked={toggleState} // Controlled input, reflects the current state
                onChange={handleChange} // Event handler for change event
            />
            <div className="knobs"></div> {/* Knobs for visual representation */}
            <div className="layer"></div> {/* Layer for additional styling */}
        </div>
    );
};

export default ToggleButton; // Export the ToggleButton component for use in other modules
