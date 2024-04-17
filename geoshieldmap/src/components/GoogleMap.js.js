
import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';
import IntervalHandler from './IntervalHandler'; // Import the IntervalHandler component

const GoogleMapFunction = () => {
    const API_KEY = "AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU"; // Replace with your Google Maps API key
    const [listening, setListening] = useState(false);
    const [successReceived, setSuccessReceived] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);

    const handleFetchData = async () => {
        try {
            const response = await fetch('https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/collect_data?category=security');
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
        googleMapsApiKey: API_KEY, // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
    });

    if (!isLoaded) {
        return <div className='h-72 w-72 bg-red'>Loading...</div>; // Render a loading state until the Google Maps API is loaded
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <GoogleMap
                center={{ lat: 48.8584, lng: 2.2945 }}
                zoom={3}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                options={{
                    mapId: 'YOUR_MAP_ID',
                    streetViewControl: false
                }}
            >
                {successReceived && <Points data={apiResponse} />} {/* Render <Points /> when successReceived is true */}
            </GoogleMap>
            <button
                onClick={handleFetchData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-2 left-48"
            >
                Fetch Data
            </button>
            {listening && (
                <IntervalHandler onSuccessReceived={handleSuccessReceived} />
            )} {/* Start interval handler when listening is true */}
        </div>
    );
};

export default GoogleMapFunction;
