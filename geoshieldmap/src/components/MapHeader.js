import React from 'react';
import IconExplain from './IconExplain';

const MapHeader = ({ selectedCategory, handleCategoryChange, handleFetchData, pointsVisible }) => {
    return (
        <div className="fixed top-0 left-0 right-0 bg-[#464444] flex items-center justify-center p-4 border-b border-black z-10">
            <div className="flex items-center justify-center">
                {/* Category selection dropdown */}
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="bg-white border rounded-md px-4 py-2 mr-4"
                >
                    <option value="security">Security</option>
                    <option value="world">World</option>
                    <option value="entertainment">Entertainment</option>
                </select>
                <button
                    onClick={handleFetchData}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Collect Data
                </button>
            </div>    
            {pointsVisible && <IconExplain />}
        </div>
    );
};

export default MapHeader;
