import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import { getGoogleMapsApiKey, getMapId } from './credentials';
import MapHeader from './MapHeader';

const GoogleMapFunction = () => {
    const API_KEY = getGoogleMapsApiKey();
    const mapId = getMapId();
    const [getData, setGetData] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('security');
    const [pointsVisible, setPointsVisible] = useState(false); // Track Points visibility
    const [startDate, setStartDate] = useState(""); // Initialize startDate state
    const [endDate, setEndDate] = useState(""); // Initialize endDate state

    const handleSetData = (e) => {
        setGetData(true);
        setPointsVisible(true);
    }

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };


    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
    });

    if (!isLoaded) {
        return <div className='h-72 w-72 bg-red'>Loading...</div>;
    }

    return (
        <>
            <MapHeader
                selectedCategory={selectedCategory}
                handleCategoryChange={handleCategoryChange}
                handleSetData={handleSetData}
                setGetData={setGetData}
                pointsVisible={pointsVisible} // Pass pointsVisible prop to MapHeader
                setStartDate={setStartDate}
                setEndDate={setEndDate}
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
                    }}
                >
                    {getData && <Points startDate={startDate} endDate={endDate} category={selectedCategory}/>}
                </GoogleMap>
                {/* {listening && (
                    <IntervalHandler onSuccessReceived={handleSuccessReceived} />
                )} */}
            </div>
        </>
    );
};

export default GoogleMapFunction;
