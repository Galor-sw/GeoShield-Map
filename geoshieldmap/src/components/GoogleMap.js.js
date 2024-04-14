import React, { useEffect, useState } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import greenIcon from '../assets/circles/green.png';
import redIcon from '../assets/circles/red.png';
import getCoordinates from './Points'; // Import the getCoordinates function

const GoogleMapFunction = () => {
    const center = { lat: 48.8584, lng: 2.2945 };
    const center1 = { lat: 48.8587, lng: 2.2947 };
    const MAP_ID = "a4a86a91eb6c31ef";
    const API_KEY = "AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU"; // Replace with your Google Maps API key

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
    });

    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        // Example usage of getCoordinates function
        getCoordinates('Israel')
            .then(coords => {
                console.log('Coordinates for Israel:', coords);
                setCoordinates(coords); // Store coordinates in state
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []); // Run once on component mount

    if (!isLoaded) {
        return <div className='h-72 w-72 bg-red'>Loading...</div>; // Render a loading state until the Google Maps API is loaded
    }

    return (
        <GoogleMap
            center={center}
            zoom={15}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
                mapId: MAP_ID,
                streetViewControl: false
            }}
        >
            <Marker
                position={center}
                options={{
                    icon: greenIcon,
                }}
            />
            <Marker
                position={center1}
                options={{
                    icon: redIcon,
                }}
            />
            {/* Any child components or overlays can be added here */}
        </GoogleMap>
    );
};

export default GoogleMapFunction;
