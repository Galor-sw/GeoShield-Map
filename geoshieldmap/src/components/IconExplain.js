import React, { useState, useEffect, useRef } from 'react';
import blueIcon from '../assets/icons/blue-security.png';
import redIcon from '../assets/icons/red-security.png';
import goldIcon from '../assets/icons/gold-security.png';
import infoIcon from '../assets/icons/info.png';

// Import new icons
import blueAntisemitismIcon from '../assets/icons/blue-antisemitism.png';
import redAntisemitismIcon from '../assets/icons/red-antisemitism.png';
import goldIconAntisemitism from '../assets/icons/gold-antisemitism.png';
import blueNaturalDisastersIcon from '../assets/icons/blue-natural-disasters.png';
import redNaturalDisastersIcon from '../assets/icons/red-natural-disasters.png';
import goldIconNaturalDisasters from '../assets/icons/gold-natural-disasters.png';

const IconExplain = () => {
    const [showExplanation, setShowExplanation] = useState(false);
    const explanationRef = useRef(null);

    const toggleExplanation = () => {
        setShowExplanation(!showExplanation);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (explanationRef.current && !explanationRef.current.contains(event.target)) {
                setShowExplanation(false);
            }
        };

        document.body.addEventListener('click', handleClickOutside);

        return () => {
            document.body.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center h-full relative" ref={explanationRef}>
            <button onClick={toggleExplanation} className="text-white ml-4 focus:outline-none">
                <img src={infoIcon} alt="Info" className="w-8 h-8" />
            </button>
            {showExplanation && (
                <div className="bg-white p-3 rounded shadow-md absolute top-full left-0 z-10 w-max mt-2">
                    <div className="mb-2">
                        <span className="font-bold">Information:</span>
                    </div>
                    {/* Security Icons */}
                    <div className="flex items-center mb-2">
                        <img src={blueIcon} alt="Blue Security Icon" className="w-5 h-5 mr-2" />
                        <span> - Telegram Security</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={redIcon} alt="Red Security Icon" className="w-5 h-5 mr-2" />
                        <span> - GDELT Security</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={goldIcon} alt="Gold Security Icon" className="w-5 h-5 mr-2" />
                        <span> - Matching Messages Security</span>
                    </div>
                    {/* Antisemitism Icons */}
                    <div className="flex items-center mb-2">
                        <img src={blueAntisemitismIcon} alt="Blue Antisemitism Icon" className="w-5 h-5 mr-2" />
                        <span> - Telegram Antisemitism</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={redAntisemitismIcon} alt="Red Antisemitism Icon" className="w-5 h-5 mr-2" />
                        <span> - GDELT Antisemitism</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={goldIconAntisemitism} alt="Gold Antisemitism Icon" className="w-5 h-5 mr-2" />
                        <span> - Matching Messages Antisemitism</span>
                    </div>
                    {/* Natural Disasters Icons */}
                    <div className="flex items-center mb-2">
                        <img src={blueNaturalDisastersIcon} alt="Blue Natural Disasters Icon" className="w-5 h-5 mr-2" />
                        <span> - Telegram Natural Disasters</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <img src={redNaturalDisastersIcon} alt="Red Natural Disasters Icon" className="w-5 h-5 mr-2" />
                        <span> - GDELT Natural Disasters</span>
                    </div>
                    <div className="flex items-center">
                        <img src={goldIconNaturalDisasters} alt="Gold Natural Disasters Icon" className="w-5 h-5 mr-2" />
                        <span> - Matching Messages Natural Disasters</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IconExplain;
