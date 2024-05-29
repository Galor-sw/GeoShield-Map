import React, { useState, useEffect } from 'react';
import IconExplain from './IconExplain';
import IntervalHandler from './IntervalHandler'; // Import the IntervalHandler component

const channelsData = {
    "GDELT_Domains": {
        " BBC": "bbc.com",
        " CNN": "cnn.com",
        " Ynet": "ynetnews.com"
    },
    "Telegram_Channels": {
        " Abu-ali": "https://t.me/englishabuali",
        " Reuters": "https://t.me/ReutersWorldChannel"
    }
};

const MapHeader = ({
    selectedCategory, handleSetData, handleCategoryChange, setGetData,
    pointsVisible, startDate, endDate, setStartDate, setEndDate ,setCustomDataUUID 
}) => {
    const [endDateError, setEndDateError] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState({
        GDELT: [],
        Telegram: []
    });
    const [loading, setLoading] = useState(false); // State for loading
    const [customDataRequested, setCustomDataRequested] = useState(false); // State for custom data requested
    const [startListening, setStartListening] = useState(false); // State for SQS listening
    const [uuid, setUuid] = useState(null); 

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setSelectedStartDate(formattedDate);
        setSelectedEndDate(formattedDate);
        setEndDate(formattedDate);
        setStartDate(formattedDate);

    }, []);

    const handleSuccessReceived = (uuid) => {
        console.log('Success message received with uuid: ', uuid);
        setCustomDataUUID(uuid)
        setCustomDataRequested(false);
        };
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setSelectedStartDate(newStartDate);
        if (selectedEndDate && selectedEndDate < newStartDate) {
            setEndDate('');
            setEndDateError(true);
        } else {
            setStartDate(newStartDate);
            setEndDateError(false);
        }
    };

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setSelectedEndDate(newEndDate);
        if (newEndDate < selectedStartDate) {
            setEndDateError(true);
            setEndDate('');
        } else {
            setEndDate(newEndDate);
            setEndDateError(false);
        }
    };

    const handleChannelSelection = (category, channel) => {
        setSelectedChannels(prevState => {
            const selected = prevState[category].includes(channel)
                ? prevState[category].filter(ch => ch !== channel)
                : [...prevState[category], channel];
            return { ...prevState, [category]: selected };
        });
    };

    const handleGetCustomData = async () => {
        const filteredChannelsData = {
            GDELT_Domains: selectedChannels.GDELT.reduce((obj, key) => {
                obj[key] = channelsData.GDELT_Domains[key];
                return obj;
            }, {}),
            Telegram_Channels: selectedChannels.Telegram.reduce((obj, key) => {
                obj[key] = channelsData.Telegram_Channels[key];
                return obj;
            }, {})
        };

        const requestData = {
            category: selectedCategory,
            ...filteredChannelsData
        };

        setLoading(true); // Start loading
        setShowModal(false); // Close modal
        try {
            const response = await fetch('https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/set_config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Response:', responseData);

            if (responseData.message === 'Configuration saved successfully and data_collection Lambda called') {
                const uuid = responseData.uuid;
                console.log("Start listening to custom data SQS");
                setUuid(uuid);
                setCustomDataRequested(true);
                setStartListening(true);
            }

        } catch (error) {
            console.error('Error:', error);
            setLoading(false); // Stop loading on error
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-[#464444] flex flex-col items-center justify-center p-4 border-b border-black z-10">
            <div className="flex items-center space-x-2">
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="bg-white border rounded-md px-4 py-2"
                    style={{ height: '2.5rem' }}
                >
                    <option value="security">Security</option>
                    <option value="antisemitism">Antisemitism</option>
                    <option value="natural-disasters">Natural-Disasters</option>
                </select>
                <input
                    type="date"
                    value={selectedEndDate}
                    min={selectedEndDate}
                    onChange={handleStartDateChange}
                    className="bg-white border rounded-md px-4 py-2"
                    style={{ height: '2.5rem' }}
                />
                <input
                    type="date"
                    value={selectedEndDate}
                    min={selectedEndDate}
                    onChange={handleEndDateChange}
                    className="bg-white border rounded-md px-4 py-2"
                    style={{ height: '2.5rem' }}
                />

                {loading ? (
                    <div className="loader"></div>
                ) : (
                    <>
                        {/* Render Get Data button */}
                        <button
                            onClick={handleSetData}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${endDateError ? 'cursor-not-allowed opacity-50' : ''}`}
                            disabled={endDateError}
                        >
                            Get Data
                        </button>
                        {!customDataRequested && ( // Render Get Custom Data button only if custom data not requested
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Get Custom Data
                            </button>
                        )}

                    </>
                )}
                {pointsVisible && <IconExplain />}
            </div>
            {endDateError && <p className="text-white bg-red-600 text-center rounded-md py-1 px-2 mt-2">End date cannot be earlier than start date</p>}
            
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white p-4 rounded-md">
                        <h2 className="text-lg font-bold mb-2">Select Channels</h2>
                        <div>
                            <h3 className="font-semibold">GDELT Domains</h3>
                            <ul>
                                {Object.keys(channelsData.GDELT_Domains).map(domain => (
                                    <li key={domain}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedChannels.GDELT.includes(domain)}
                                                onChange={() => handleChannelSelection('GDELT', domain)}
                                            />
                                            {domain}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold">Telegram Channels</h3>
                            <ul>
                                {Object.keys(channelsData.Telegram_Channels).map(channel => (
                                    <li key={channel}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedChannels.Telegram.includes(channel)}
                                                onChange={() => handleChannelSelection('Telegram', channel)}
                                            />
                                            {channel}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGetCustomData}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Get Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Include IntervalHandler to listen to SQS when custom data is requested */}
            {startListening && (
                <IntervalHandler 
                    uuid={uuid} // Pass the UUID to IntervalHandler
                    onSuccessReceived={() => {
                        handleSuccessReceived(uuid); 
                        setStartListening(false); // Stop listening after successful message receipt
                        setLoading(false); // Stop loading indicator
                    }} 
                />
            )}
        </div>
    );
};

export default MapHeader;
