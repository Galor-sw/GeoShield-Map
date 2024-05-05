import React, { useState } from 'react';
import IconExplain from './IconExplain';

const MapHeader = ({ selectedCategory, handleSetData, handleCategoryChange, setGetData, pointsVisible, startDate, endDate, setStartDate, setEndDate }) => {
    const [endDateError, setEndDateError] = useState(false); // State to track end date error
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setSelectedStartDate(newStartDate);
        if (selectedEndDate && selectedEndDate < newStartDate) {
            setEndDate('');
            setEndDateError(true); // Set end date error if end date is earlier than start date
        } else {
            setStartDate(newStartDate); // Set the new start date
            setEndDateError(false); // Reset end date error if end date is valid
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setSelectedEndDate(newEndDate);
        if (newEndDate < selectedStartDate) {
            setEndDateError(true); // Set end date error to true if end date is earlier than start date
            setEndDate('');
        } else {
            setEndDate(newEndDate);
            setEndDateError(false); // Reset end date error if end date is valid
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-[#464444] flex flex-col items-center justify-center p-4 border-b border-black z-10">
            <div className="flex items-center space-x-2">
                {/* Category selection dropdown */}
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="bg-white border rounded-md px-4 py-2"
                    style={{ height: '2.5rem' }} // Set fixed height
                >
                    <option value="security">Security</option>
                    <option value="world">World</option>
                    <option value="entertainment">Entertainment</option>
                </select>
                {/* Start date input field */}
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="bg-white border rounded-md px-4 py-2"
                    style={{ height: '2.5rem' }} // Set fixed height
                />
                {/* End date input field */}
                <input
                    type="date"
                    value={endDate}
                    min={startDate} // Set minimum allowed date as the start date
                    onChange={handleEndDateChange}
                    className="bg-white border rounded-md px-4 py-2"
                    style={{ height: '2.5rem' }} // Set fixed height
                />
                <button
                    onClick={handleSetData} // Use a click handler that checks for end date error
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${endDateError ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={endDateError} // Disable the button if end date error exists
                >
                    Get Data
                </button>
            {pointsVisible && <IconExplain />}
            </div>
            {endDateError && <p className="text-white bg-red-600 text-center rounded-md py-1 px-2 mt-2">End date cannot be earlier than start date</p>}
        </div>
    );
};

export default MapHeader;
