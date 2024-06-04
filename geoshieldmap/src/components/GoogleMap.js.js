import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import { getGoogleMapsApiKey, getMapId } from './credentials';
import MapHeader from './MapHeader';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import gpsIcon from '../assets/icons/gps.png'; // Import the GPS icon
import Graph from './Graph.js'; // Import the Graph component

const GoogleMapFunction = () => {
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


    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
        libraries: ['places'],
    });

    useEffect(() => {
        console.log("getData: " + getData);
    }, [getData]);
    useEffect(() => {
        console.log('selectedCategories has changed:', selectedCategories);

    }, [selectedCategories]);


    const handleSetData = (e) => {
        setGetData(prevState => !prevState);  // Toggle getData to force re-render
        setPointsVisible(true);
        setCustomUUID("");
    };



    const setCustomDataUUID = (e) => {
        console.log("in setCustomDataUUID");
        setCustomUUID(e);
        setGetData(prevState => !prevState);  // Toggle getData to force re-render
        setPointsVisible(true);
    };


    const onMapLoad = mapInstance => {
        setMap(mapInstance);
    };

    const handlePlaceSelect = async (address) => {
        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        map.panTo({ lat, lng });
        map.setZoom(6); // Adjust the zoom level here to ensure the entire country is visible
    };

    if (!isLoaded) {
        return <div className='h-72 w-72 bg-red'>Loading...</div>;
    }

    // Define the world bounds
    const worldBounds = {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
    };

    const handleCreateGraph = (selectedLocation, selectedCategories) => {
        // Gather selected locations
        // Make API GET call with selected locations as parameters
        if (selectedLocation) {
            fetch(`https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/get_statistics?location=${selectedLocation}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Process the data received from the API
                    console.log('Received data:', data);
                    console.log('selectedCategories:', selectedCategories);

                    // Filter the data based on selected categories
                    const filteredData = [];
                    const locationKey = selectedLocation + '\n';

                    data[locationKey].forEach(categoryObject => {
                        const existsCategory=Object.keys(categoryObject)[0];

                        selectedCategories.forEach(category =>
                            {
                                if (category.value== existsCategory)
                                    {
                                        filteredData.push(categoryObject);
                                    }
                            }
                        )
    
                    });
                    console.log('Filtered data:', filteredData);
                    // Set the filtered data to state
                    setGraphData({
                        filteredData,
                        selectedCategories,
                        selectedLocation,
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Handle errors here
                });
        }
    };
    
    

    return (
        <div style={{ backgroundColor: '#333',position: 'relative', width: '100%', height: '100vh' }}>
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
                />
            </div>
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
                            {pointsVisible && (
                                <Points 
                                    startDate={startDate}
                                    endDate={endDate}
                                    categories={selectedCategories}
                                    uuid={customUUID}
                                    setReceivedData={setReceivedData}
                                />
                            )}
                        </GoogleMap>
                        {searchVisible && <FloatingSearchBar onPlaceSelect={handlePlaceSelect} />}
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
                    </div>
                </div>
                )}

                {statisticMode && graphData && (
                <div style={{  position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ position: 'relative' ,width: '100%', height: '100%' }}>
                        <Graph
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

    const handleInput = (e) => {
        setValue(e.target.value);
    };

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();
        onPlaceSelect(address);
    };

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
