import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import IntervalHandler from './IntervalHandler'; // Import the IntervalHandler component
import { getGoogleMapsApiKey, getMapId } from './credentials';

const GoogleMapFunction = () => {
    const API_KEY = getGoogleMapsApiKey(); // Replace with your Google Maps API key
    const mapId = getMapId();
    const [listening, setListening] = useState(false);
    const [successReceived, setSuccessReceived] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('security'); // Default category selection

    const handleFetchData = async () => {
        try {
            const response = await fetch(`https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/collect_data?category=${selectedCategory}`);
            const data = await response.json();
            console.log('API Response:', data);
            setApiResponse(data);
            setListening(true); // Start listening to SQS after API call

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSuccessReceived = () => {
        setSuccessReceived(true); // Enable <Points /> component upon receiving success message
    };

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
    });

    if (!isLoaded) {
        return <div className='h-72 w-72 bg-red'>Loading...</div>; // Render a loading state until the Google Maps API is loaded
    }

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-[#464444] flex items-center justify-center p-4 border-b border-black z-10">
                {/* Category selection dropdown */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    {successReceived && <Points jsonData={apiResponse} />} {/* Render <Points /> when successReceived is true */}
                </GoogleMap>
                {listening && (
                    <IntervalHandler onSuccessReceived={handleSuccessReceived} />
                )} {/* Start interval handler when listening is true */}
            </div>
        </>
    );
};

export default GoogleMapFunction;
