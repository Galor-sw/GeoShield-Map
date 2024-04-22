import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import redIcon from '../assets/circles/red.png';
import blueIcon from '../assets/circles/blue.png';
import goldIcon from '../assets/circles/gold.png';

const apiKey = 'AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU'; // Replace with your Google Maps API key

const MarkerPoints = ({ jsonData, icon }) => {
    const [markers, setMarkers] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            const promises = jsonData.map(async (item) => {
                const location = item.location;

                // Fetch coordinates for location using Google Maps Geocoding API
                const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.status === 'OK' && data.results.length > 0) {
                    const result = data.results[0];
                    const { lat, lng } = result.geometry.location;
                    
                    return {
                        id: item.id,
                        position: { lat, lng },
                        message: item.message, // Use item.message by default
                        type: item.type // Assuming 'type' specifies the data type (gdelt_articles, telegram_messages, matching_messages)
                    };
                }

                return null; // Return null if coordinates are not found
            });

            // Wait for all promises to resolve and filter out null results
            const resolvedMarkers = await Promise.all(promises);
            setMarkers(resolvedMarkers.filter(marker => marker !== null));
        };

        if (jsonData.length > 0) {
            fetchCoordinates();
        }
    }, [jsonData]); // Run fetchCoordinates whenever jsonData changes

    const handleMarkerClick = (marker) => {
        setActiveMarker(marker);
    };

    const handleCloseInfoWindow = () => {
        setActiveMarker(null);
    };

    const getMarkerIcon = (iconString) => {
        switch (iconString) {
            case 'gold':
                return goldIcon;
            case 'blue':
                return blueIcon;
            case 'red':
            default:
                return redIcon;
        }
    };

    const renderMessage = (item) => {
        console.log('@@@', item);
        if (icon === 'gold') {
            // Return combined messages with a line break if icon is "gold"
            return (
                <div>
                    <p>{item.Telegram_message}</p>
                    <p>{item.GDELT_message}</p>
                </div>
            );
        } else {
            // Return regular message
            return <p>{item.message}</p>;
        }
    };

    return (
        <>
            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={{
                        url: getMarkerIcon(icon),
                    }}
                    onClick={() => handleMarkerClick(marker)}
                >
                    {activeMarker === marker && (
                        <InfoWindow
                            position={marker.position}
                            onCloseClick={handleCloseInfoWindow}
                            options={{
                                pixelOffset: new window.google.maps.Size(0, -24), // Adjust vertical offset to position above marker
                                anchor: new window.google.maps.Point(0, -24) // Anchor at bottom center of the InfoWindow
                            }}
                        >
                            <div>
                                {renderMessage(marker)}
                            </div>
                        </InfoWindow>
                    )}
                </Marker>
            ))}
        </>
    );
};

export default MarkerPoints;
