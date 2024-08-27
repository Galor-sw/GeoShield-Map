import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import { getGoogleMapsApiKey, getMapId } from './credentials';
import MapHeader from './MapHeader';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import gpsIcon from '../assets/icons/gps.png';
import clearIcon from '../assets/icons/clear.png';
import Graph from './Graph.js';
import {getAPIAWS } from './credentials.js';

// Main component for rendering the Google Map and associated functionality
const GoogleMapFunction = () => {
    // State variables
    const API_KEY = getGoogleMapsApiKey();
    const mapId = getMapId();
    const [getData, setGetData] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [pointsVisible, setPointsVisible] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [map, setMap] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [customUUID, setCustomUUID] = useState("");
    const [receivedData, setReceivedData] = useState(false);
    const [statisticMode, setStatisticMode] = useState(false);
    const [graphData, setGraphData] = useState(null); 
    const [graphDataReceived, setGraphDataReceived] = useState(true); 

    // Load Google Maps API
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
        libraries: ['places'],
    });

    // Effect hooks for logging state changes
    useEffect(() => {
        console.log("getData: " + getData);
    }, [getData]);

    useEffect(() => {
        console.log('selectedCategories has changed:', selectedCategories);
    }, [selectedCategories]);

    // Handler for setting data and clearing points
    const handleSetData = async (e) => {
        console.log("handleSetData");
        await handleClearPoints();
        setGetData(true); 
        setPointsVisible(true);
        setCustomUUID("");
    };

    // Handler for setting custom UUID data
    const setCustomDataUUID = async (e) => {
        console.log("in setCustomDataUUID");
        await handleClearPoints();
        setCustomUUID(e);
        setGetData(true);  
        setPointsVisible(true);
    };

    // Handler for map load event
    const onMapLoad = mapInstance => {
        setMap(mapInstance);
    };

    // Handler for place selection in search
    const handlePlaceSelect = async (address) => {
        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        map.panTo({ lat, lng });
        map.setZoom(6);
    };

    // Loading state
    if (!isLoaded) {
        return <div className='h-72 w-72 bg-red'>Loading...</div>;
    }

    // Define world bounds for map restriction
    const worldBounds = {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
    };

    // Handler for creating graph data
    const handleCreateGraph = (selectedLocation, selectedCategories) => {
        const fetchData = () => {
            setGraphDataReceived(false);
            setGraphData(null);
    
            if (selectedLocation) {
                fetch(`${getAPIAWS()}/get_statistics?location=${selectedLocation}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Received data:', data);
                        console.log('selectedCategories:', selectedCategories);
    
                        // Filter data based on selected categories
                        const filteredData = [];
    
                        data[selectedLocation].forEach(categoryObject => {
                            const existsCategory = Object.keys(categoryObject)[0];
    
                            selectedCategories.forEach(category => {
                                if (category.value === existsCategory) {
                                    filteredData.push(categoryObject);
                                }
                            });
                        });
    
                        console.log('Filtered data:', filteredData);
    
                        setGraphData({
                            filteredData,
                            selectedCategories,
                            selectedLocation,
                        });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // Retry after 7 minutes
                        setTimeout(fetchData, 420000);
                    });
            }
        };
    
        fetchData();
    };

    // Handler for clearing points
    const handleClearPoints = () => {
        setPointsVisible(false);
    };
    
    return (
        <div style={{ backgroundColor: '#333',position: 'relative', width: '100%', height: '100vh' }}>
            {/* Map Header Component */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <MapHeader
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    handleSetData={handleSetData}
                    receivedData={receivedData}
                    pointsVisible={pointsVisible}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setCustomDataUUID={setCustomDataUUID}
                    setGetData={setGetData}
                    setReceivedData={setReceivedData}
                    searchVisible={searchVisible}
                    setSearchVisible={setSearchVisible}
                    setStatisticMode={setStatisticMode}
                    handleCreateGraph={handleCreateGraph}
                    graphDataReceived={graphDataReceived}
                />
            </div>
            {/* Google Map Component */}
            {!statisticMode && (
                <div style={{ position: 'absolute', top: '56px', left: 0, right: 0, bottom: 0 }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <GoogleMap
                            center={{ lat: 32.07467, lng: 34.78154 }}
                            zoom={3}
                            mapContainerStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            options={{
                                mapId: mapId,
                                streetViewControl: false,
                                mapTypeControl: false,
                                restriction: {
                                    latLngBounds: worldBounds,
                                    strictBounds: true,
                                },
                            }}
                            onLoad={onMapLoad}
                        >
                            {/* Render Points component when visible */}
                            {pointsVisible && (
                                <Points 
                                    startDate={startDate}
                                    endDate={endDate}
                                    categories={selectedCategories}
                                    uuid={customUUID}
                                    setReceivedData={setReceivedData}
                                    getData={getData}
                                />
                            )}
                        </GoogleMap>
                        {/* Render FloatingSearchBar when search is visible */}
                        {searchVisible && <FloatingSearchBar onPlaceSelect={handlePlaceSelect} />}
                        {/* GPS button */}
                        <button
                            onClick={() => setSearchVisible(!searchVisible)}
                            style={{
                                position: 'absolute',
                                bottom: 30,
                                left: 20,
                                zIndex: 1000,
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            }}
                        >
                            <img src={gpsIcon} alt="Search Location" style={{ width: '70%', height: '70%' }} />
                        </button>
                        {/* Clear points button */}
                        <button
                            onClick={handleClearPoints}
                            style={{
                                position: 'absolute',
                                bottom: 30,
                                left: 70,
                                zIndex: 1000,
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            }}
                        >
                            <img src={clearIcon} alt="Clear Points" style={{ width: '70%', height: '70%' }} />
                        </button>
                    </div>
                </div>
            )}
            {/* Render Graph component in statistic mode */}
            {statisticMode && graphData && (
                <div style={{  position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative' ,width: '100%', height: '100%' }}>
                        <Graph
                            setGraphDataReceived={setGraphDataReceived}
                            filteredData={graphData.filteredData}
                            selectedCategories={graphData.selectedCategories}
                            selectedLocation={graphData.selectedLocation}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Component for rendering a floating search bar
const FloatingSearchBar = ({ onPlaceSelect }) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here */
        },
        debounce: 300,
    });

    // Handler for input change
    const handleInput = (e) => {
        setValue(e.target.value);
    };

    // Handler for place selection
    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();
        onPlaceSelect(address);
    };

    // Styles for the search bar and suggestions
    const containerStyle = {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 1000,
        width: '300px',
        padding: '10px',
        fontSize: '16px',
    };

    const dropdownContainerStyle = {
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        marginTop: '2px',
        zIndex: 1001,
        position: 'absolute',
        width: '300px',
    };

    const suggestionStyle = {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
    };

    const suggestionHoverStyle = {
        backgroundColor: '#f1f1f1',
    };

    return (
        <div style={containerStyle}>
            <input
                value={value}
                onChange={handleInput}
                disabled={!ready}
                placeholder="Search location"
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    marginTop: '30px'
                }}
            />
            {status === 'OK' && (
                <div style={dropdownContainerStyle}>
                    {data.map(({ place_id, description }) => (
                        <div
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            style={suggestionStyle}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = suggestionHoverStyle.backgroundColor)}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                        >
                            {description}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GoogleMapFunction;