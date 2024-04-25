import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import IntervalHandler from './IntervalHandler'; // Import the IntervalHandler component
import { getGoogleMapsApiKey } from './credentials'; 

const GoogleMapFunction = () => {
    const API_KEY = getGoogleMapsApiKey(); // Replace with your Google Maps API key
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
        <div style={{ width: '100%', height: '100%' }}>
            {/* Category selection dropdown */}
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border rounded-md px-4 py-2 mt-4 ml-4"
            >
                <option value="security">Security</option>
                <option value="world">World</option>
                <option value="entertainment">Entertainment</option>
            </select>

            <GoogleMap
                center={{ lat: 48.8584, lng: 2.2945 }}
                zoom={3}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                options={{
                    mapId: 'YOUR_MAP_ID',
                    streetViewControl: false
                }}
            >
                {successReceived && <Points jsonData={apiResponse} />} {/* Render <Points /> when successReceived is true */}
            </GoogleMap>
            <button
                onClick={handleFetchData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-2 left-48"
            >
                Collect Data
            </button>
            {listening && (
                <IntervalHandler onSuccessReceived={handleSuccessReceived} />
            )} {/* Start interval handler when listening is true */}
        </div>
    );
};

export default GoogleMapFunction;
