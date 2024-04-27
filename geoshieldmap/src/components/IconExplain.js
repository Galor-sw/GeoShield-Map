import React, { useState } from 'react';
import blueIcon from '../assets/icons/blue.png';
import redIcon from '../assets/icons/red.png';
import goldIcon from '../assets/icons/gold.png';
import infoIcon from '../assets/icons/info.png'; // Import the infoIcon

const IconExplain = () => {
    const [showExplanation, setShowExplanation] = useState(false);

    const toggleExplanation = () => {
        setShowExplanation(!showExplanation);
    };

    return (
        <div className="flex items-center h-full relative">
            {/* Button to toggle icon explanation visibility */}
            <button onClick={toggleExplanation} className="text-white ml-4 focus:outline-none">
                <img src={infoIcon} alt="Info" className="w-8 h-8" /> {/* Use the infoIcon here */}
            </button>
            {/* Explanation content */}
            {showExplanation && (
                <div className="bg-white p-3 rounded shadow-md absolute top-full left-0 z-10 w-max mt-2">
                    <div className="mb-2">
                        <span className="font-bold">Information:</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={blueIcon} alt="Blue Icon" className="w-5 h-5 mr-2" />
                        <span> - Telegram</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={redIcon} alt="Red Icon" className="w-5 h-5 mr-2" />
                        <span> - GDELT</span>
                    </div>
                    <div className="flex items-center">
                        <img src={goldIcon} alt="Gold Icon" className="w-5 h-5 mr-2" />
                        <span> - Matching Messages</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IconExplain;
