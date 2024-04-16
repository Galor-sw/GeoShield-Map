import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import Points from './Points';

const GoogleMapFunction = () => {
    const center = { lat: 48.8584, lng: 2.2945 };
    const MAP_ID = "a4a86a91eb6c31ef";
    const API_KEY = "AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU"; // Replace with your Google Maps API key

        const { isLoaded } = useJsApiLoader({
            googleMapsApiKey: API_KEY,
        });

        const [fetchData, setFetchData] = useState(false);

        const handleFetchData = () => {
            setFetchData(true); // Set fetchData to true to trigger data fetching in <Points />
        };

        if (!isLoaded) {
            return <div className='h-72 w-72 bg-red'>Loading...</div>; // Render a loading state until the Google Maps API is loaded
        }

        return (
            <div style={{ width: '100%', height: '100%' }}>
                <GoogleMap
                    center={center}
                    zoom={3}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    options={{
                        mapId: MAP_ID,
                        streetViewControl: false
                    }}
                >
                    {fetchData && <Points />} {/* Render <Points /> only when fetchData is true */}
                </GoogleMap>
                <button
                    onClick={handleFetchData}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-2 left-48"
                >
                    Fetch Data
                </button>
            </div>
        );
    };

    export default GoogleMapFunction;
