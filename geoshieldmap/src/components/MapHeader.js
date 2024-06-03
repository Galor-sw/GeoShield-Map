import React, { useState, useEffect } from 'react';
import IconExplain from './IconExplain';
import IntervalHandler from './IntervalHandler'; // Import the IntervalHandler component
import Select from 'react-select'; // Import react-select
import countriesData from '../assets/Data/countries.json'; // Import the countries data

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

const categoryOptions = [
    { value: 'security', label: 'Security' },
    { value: 'antisemitism', label: 'Antisemitism' },
    { value: 'natural-disasters', label: 'Natural-Disasters' }
];

const MapHeader = ({
    selectedCategories, setSelectedCategories, handleSetData, receivedData,
    pointsVisible, setStartDate, setEndDate, setCustomDataUUID, setGetData, setReceivedData ,setStatisticMode ,handleCreateGraph
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
    const [categoryError, setCategoryError] = useState(false); // State for category error message
    const [toggleState, setToggleState] = useState(false); // State for the toggle switch
    const [countryOptions, setCountryOptions] = useState([]); // State for country options
    const [selectedLocation, setSelectedLocation] = useState("");
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    useEffect(() => {
        setSelectedStartDate(formattedDate);
        setSelectedEndDate(formattedDate);
        setEndDate(formattedDate);
        setStartDate(formattedDate);
        const countries = countriesData.countries.map(country => ({ value: country, label: country }));
        setCountryOptions(countries);
    }, []);


    useEffect(() => {
        console.log('receivedData has changed:', receivedData);
        if (receivedData === true)
            setLoading(false);

    }, [receivedData]);

    useEffect(() => {
        console.log('Toggle state:', toggleState); // Print the toggle state
        setStatisticMode(toggleState);
        setSelectedLocation(""); 
    }, [toggleState]);

    useEffect(() => {
        console.log('selectedLocation has changed:', selectedLocation);

    }, [selectedLocation]);

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
        // Ensure only one category is selected
        if (selectedCategories.length !== 1) {
            setCategoryError(true);
            return;
        }

        setCategoryError(false); // Reset category error message

        const selectedCategory = selectedCategories[0].value;

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
        setGetData(false);
        setReceivedData(false);
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
            let uuid;
            if (responseData.message === 'Configuration saved successfully and data_collection Lambda called') {
                uuid = responseData.uuid;
                console.log("Start listening to custom data SQS");
                setUuid(uuid);
                setCustomDataRequested(true);
                setStartListening(true);
            }
            else if (responseData.message === 'Configuration already exists') {
                uuid = responseData.uuid;
                handleSuccessReceived(uuid);
            }

        } catch (error) {
            console.error('Error:', error);
            setLoading(false); // Stop loading on error
        }
    };

    const handleShowModal = () => {
        if (selectedCategories.length !== 1) {
            setCategoryError(true);
        } else {
            setCategoryError(false);
            setShowModal(true);
        }
    };

    const handleToggleChange = () => {
        setToggleState(prevState => !prevState); // Toggle the state
    };



    const setLocation =(e) =>
    {
        console.log(e.value);
        if (e.value)
            setSelectedLocation(e.value);
    };
    

    return (
        <div className="fixed top-0 left-0 right-0 bg-[#464444] flex items-center justify-between p-4 border-b border-black z-10">
            <div className="flex items-center space-x-2">
                {toggleState ? (
                    <>
                        <Select
                            isMulti={false} // Set isMulti to false to allow only single selection
                            value={countryOptions.find(option => option.value === selectedLocation)} // Update value based on selectedLocation
                            onChange={setLocation}
                            options={countryOptions}
                            className="w-64"
                        />
                        <Select
                            isMulti
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                            options={categoryOptions}
                            className="w-64"
                        />
                        <button
                            onClick={() => handleCreateGraph(selectedLocation,selectedCategories)}
                            className="bg-green-500 hover:bg-green-700 text-white
                            font-bold py-2 px-4 rounded"
                        >
                            Create Graph
                        </button>
                    </>
                ) : (
                    <>
                        <Select
                            isMulti
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                            options={categoryOptions}
                            className="w-64"
                        />
                        <input
                            type="date"
                            value={selectedStartDate}
                            onChange={handleStartDateChange}
                            className="bg-white border rounded-md px-4 py-2"
                            style={{ height: '2.5rem' }}
                        />
                        <input
                            type="date"
                            value={selectedEndDate}
                            max={formattedDate}
                            onChange={handleEndDateChange}
                            className="bg-white border rounded-md px-4 py-2"
                            style={{ height: '2.5rem' }}
                        />
                        {loading ? (
                            <div className="loader"></div>
                        ) : (
                            <>
                                <button
                                    onClick={handleSetData}
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${endDateError ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={endDateError}
                                >
                                    Get Data
                                </button>
                                {!customDataRequested && (
                                    <button
                                        onClick={handleShowModal}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Get Custom Data
                                    </button>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
            <div>
                <label className="mr-2 text-white">Statistics Mod:</label>
                <label className="switch">
                    <input type="checkbox" checked={toggleState} onChange={handleToggleChange} />
                    <span className="slider round"></span>
                </label>
            </div>
            {endDateError && <p className="text-white bg-red-600 text-center rounded-md py-1 px-2 mt-2">End date cannot be earlier than start date</p>}
            {categoryError && <p className="text-white bg-red-600 text-center rounded-md py-1 px-2 mt-2">Please select exactly one category</p>}

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
                                onClick={() => handleGetCustomData}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Get Custom Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {startListening && (
                <IntervalHandler
                    uuid={uuid}
                    handleSuccessReceivedHeader={handleSuccessReceived}
                />
            )}
        </div>
    );
};

export default MapHeader;
