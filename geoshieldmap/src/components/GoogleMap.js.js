import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import IntervalHandler from './IntervalHandler';
import { getGoogleMapsApiKey, getMapId } from './credentials';
import MapHeader from './MapHeader';

const GoogleMapFunction = () => {
    const API_KEY = getGoogleMapsApiKey();
    const mapId = getMapId();
    const [listening, setListening] = useState(false);
    const [successReceived, setSuccessReceived] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('security');
    const [pointsVisible, setPointsVisible] = useState(false); // Track Points visibility
    const [startDate, setStartDate] = useState(""); // Initialize startDate state
    const [endDate, setEndDate] = useState(""); // Initialize endDate state


    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFetchData = async () => {
        console.log(startDate);
        console.log(endDate);
        try {
            const response = await fetch(`https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/collect_data?category=${selectedCategory}`);
            const data = await response.json();
            console.log('API Response:', data);
            setApiResponse(data);
            setListening(true);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSuccessReceived = () => {
        setSuccessReceived(true);
        setPointsVisible(true); // Set Points visibility to true when received success
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
                handleFetchData={handleFetchData}
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
                    {successReceived && <Points jsonData={apiResponse} startDate={startDate} endDate={endDate} />}
                </GoogleMap>
                {listening && (
                    <IntervalHandler onSuccessReceived={handleSuccessReceived} />
                )}
            </div>
        </>
    );
};

export default GoogleMapFunction;
