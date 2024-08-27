import React, { useState, useEffect } from 'react';
import IconExplain from './IconExplain';
import IntervalHandler from './IntervalHandler'; // Import the IntervalHandler component
import Select from 'react-select'; // Import react-select
import countriesData from '../assets/Data/countries.json'; // Import the countries data
import SystemIcon from '../assets/icons/logo_1.png';
import ToggleButton from './ToggleButton.js';
import {getAWSServiceURL,getAPIAWS} from './credentials.js'; // Import credentials functions



/**
 * MapHeader Component
 * 
 * This component renders the header of the map interface, including various controls
 * for data selection, date range picking, and custom data retrieval.
 *
 * @param {Object} props
 * @param {Array} props.selectedCategories - Currently selected categories
 * @param {Function} props.setSelectedCategories - Function to update selected categories
 * @param {Function} props.handleSetData - Function to handle data setting
 * @param {boolean} props.receivedData - Flag indicating if data has been received
 * @param {boolean} props.pointsVisible - Flag indicating if map points are visible
 * @param {Function} props.setStartDate - Function to set start date
 * @param {Function} props.setEndDate - Function to set end date
 * @param {Function} props.setCustomDataUUID - Function to set custom data UUID
 * @param {Function} props.setGetData - Function to trigger data fetching
 * @param {Function} props.setReceivedData - Function to update received data status
 * @param {Function} props.setStatisticMode - Function to set statistic mode
 * @param {Function} props.handleCreateGraph - Function to handle graph creation
 * @param {boolean} props.graphDataReceived - Flag indicating if graph data has been received
 */
const MapHeader = ({
    selectedCategories, setSelectedCategories, handleSetData, receivedData,
    pointsVisible, setStartDate, setEndDate, setCustomDataUUID, setGetData, setReceivedData, setStatisticMode, handleCreateGraph, graphDataReceived
}) => {
    // State variables
    const [endDateError, setEndDateError] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedChannels, setSelectedChannels] = useState({
        GDELT: [],
        Telegram: []
    });
    const [loading, setLoading] = useState(false);
    const [customDataRequested, setCustomDataRequested] = useState(false);
    const [startListening, setStartListening] = useState(false);
    const [uuid, setUuid] = useState(null);
    const [categoryError, setCategoryError] = useState(false);
    const [toggleState, setToggleState] = useState(false);
    const [countryOptions, setCountryOptions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("Israel");
    const [categoryOptions, setCategoryOptions] = useState([]);
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const [channelsData, setChannelsData] = useState({
        GDELT_Domains: {},
        Telegram_Channels: {}
    });

    // Effect hooks
    useEffect(() => {
        // Initialize dates and fetch country and category options
        setSelectedStartDate(formattedDate);
        setSelectedEndDate(formattedDate);
        setEndDate(formattedDate);
        setStartDate(formattedDate);
    
        const sortedCountries = countriesData.countries.sort((a, b) => a.localeCompare(b));
        const countries = sortedCountries.map(country => ({ value: country, label: country }));
        setCountryOptions(countries);

        const fetchCategoryOptions = async () => {
            try {
                const response = await fetch(`${getAWSServiceURL()}/get-categories`);
                const data = await response.json();
                const options = data.categories.map(category => ({
                    value: category.value,
                    label: category.label
                }));                
                setCategoryOptions(options);
                setSelectedCategories([{ value: 'security', label: 'Security' }]);
            } catch (error) {
                console.error('Error fetching category options:', error);
            }
        };

        fetchCategoryOptions();
    }, []);
    
    useEffect(() => {
        // Fetch channels data
        const fetchChannelsData = async () => {
            try {
                const response = await fetch(`${getAWSServiceURL()}/get-sources`);
                const data = await response.json();
                setChannelsData(data);
            } catch (error) {
                console.error('Error fetching channels data:', error);
            }
        };

        fetchChannelsData();
    }, []);

    useEffect(() => {
        if (receivedData === true)
            setLoading(false);
    }, [receivedData]);

    useEffect(() => {
        setStatisticMode(toggleState);
    }, [toggleState]);

    // Handler functions
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
        if (selectedCategories.length !== 1) {
            setCategoryError(true);
            return;
        }

        setCategoryError(false);

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

        setLoading(true);
        setShowModal(false);
        setGetData(false);
        setReceivedData(false);
        try {
            const response = await fetch(`${getAPIAWS()}/set_config`, {
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
            let uuid;
            if (responseData.message === 'Configuration saved successfully and data_collection Lambda called') {
                uuid = responseData.uuid;
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
            setLoading(false);
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

    const setLocation = (e) => {
        if (e.value)
            setSelectedLocation(e.value);
    };

    const handleGetDataRequest = (e) => {
      setReceivedData(false);
      setLoading(true)
      handleSetData();  
    };
    

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: '#333',
            borderColor: '#555',
            color: '#fff',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#333',
            color: '#fff',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#555' : '#333',
            color: '#fff',
            '&:hover': {
                backgroundColor: '#444',
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#555',
            color: '#fff',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#fff',
            '&:hover': {
                backgroundColor: '#777',
            },
        }),
        input: (provided) => ({
            ...provided,
            color: '#fff',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#aaa',
        }),
    };
    
    return (
        <div style={{position: 'relative'}} className="fixed top-0 left-0 right-0 bg-[#333333] flex flex-col items-center justify-between p-4 border-b border-gray-800 z-10">
                <div style={{position: 'absolute', left: '20px' , top: '11px'}}  >
                    <img src={SystemIcon} alt="System Icon"  style={{width: '55px' , height: '55px'}}  />
                </div>
                <div className="flex items-center space-x-2 ">
                    {toggleState ? (
                        <>
                            <Select
                                isMulti={false}
                                value={countryOptions.find(option => option.value === selectedLocation)}
                                onChange={setLocation}
                                options={countryOptions}
                                className="w-64"
                                styles={customStyles} // Apply custom styles
                            />
                            <Select
                                isMulti
                                value={selectedCategories}
                                onChange={setSelectedCategories}
                                options={categoryOptions}
                                className="w-full" // Use full width class
                                styles={{ ...customStyles, container: (base) => ({ ...base, width: '28rem' }) }} // Inline style for custom width
                            />
                            {  !graphDataReceived ? (
                                <div className="loader"></div>
                            ) :
                            (<button
                                onClick={() => handleCreateGraph(selectedLocation, selectedCategories)}
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                >
                                Create Graph
                            </button> )}
                        </>
                    ) : (
                        <>
                            <Select
                                isMulti
                                value={selectedCategories}
                                onChange={setSelectedCategories}
                                options={categoryOptions}
                                className="w-full" // Use full width class
                                styles={{ ...customStyles, container: (base) => ({ ...base, width: '28rem' }) }} // Inline style for custom width
                            />

                            <input
                                type="date"
                                value={selectedStartDate}
                                onChange={handleStartDateChange}
                                className="bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white" // Dark mode styles
                                style={{ height: '2.5rem' }}
                            />
                            <input
                                type="date"
                                value={selectedEndDate}
                                max={formattedDate}
                                onChange={handleEndDateChange}
                                className="bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white" // Dark mode styles
                                style={{ height: '2.5rem' }}
                            />
                            {loading ? (
                                <div className="loader"></div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleGetDataRequest}
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
                    {pointsVisible && !toggleState && <IconExplain />}
                </div>
                <div style={{position: 'absolute', right: '20px'}}  >
                <ToggleButton
                    setToggleState={setToggleState} 
                    toggleState={toggleState} 
                />  
            </div>
        
            {endDateError && <p className="text-white bg-red-600 text-center rounded-md py-1 px-2 mt-2">End date cannot be earlier than start date</p>}
            {categoryError && <p className="text-white bg-red-600 text-center rounded-md py-1 px-2 mt-2">Please select exactly one category</p>}
        
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-20">
                    <div className="bg-gray-800 p-4 rounded-md">
                        <h2 className="text-lg font-bold mb-2 text-white">Select Channels</h2>
                        <div>
                            <h3 className="font-semibold text-white">GDELT Domains</h3>
                            <ul>
                                {Object.keys(channelsData.GDELT_Domains).map(domain => (
                                    <li key={domain}>
                                        <label className="text-white">
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
                            <h3 className="font-semibold text-white">Telegram Channels</h3>
                            <ul>
                                {Object.keys(channelsData.Telegram_Channels).map(channel => (
                                    <li key={channel}>
                                        <label className="text-white">
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
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" // Red button style
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGetCustomData}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" // Blue button style
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