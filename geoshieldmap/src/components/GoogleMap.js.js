import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import { getGoogleMapsApiKey, getMapId } from './credentials';
import MapHeader from './MapHeader';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import gpsIcon from '../assets/icons/gps.png'; // Import the GPS icon

const GoogleMapFunction = () => {
    const API_KEY = getGoogleMapsApiKey();
    const mapId = getMapId();
    const [getData, setGetData] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('security');
    const [pointsVisible, setPointsVisible] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [map, setMap] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [customUUID, setCustomUUID] = useState("");
    const [receivedData, setReceivedData] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
        libraries: ['places'],
    });

    useEffect(() => {
        console.log("getData: " + getData);
    }, [getData]);

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

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
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

    return (
        <>
            <MapHeader
                selectedCategory={selectedCategory}
                handleSetData={handleSetData}
                handleCategoryChange={handleCategoryChange}
                receivedData={receivedData}
                pointsVisible={pointsVisible}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setCustomDataUUID={setCustomDataUUID}
                setGetData={setGetData}
                setReceivedData={setReceivedData}
            />
            <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 56px)' }}>
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
                            key={JSON.stringify({ startDate, endDate, selectedCategory, customUUID, getData })}
                            startDate={startDate}
                            endDate={endDate}
                            category={selectedCategory}
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
        </>
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
