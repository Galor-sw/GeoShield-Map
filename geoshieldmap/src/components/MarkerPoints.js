import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import redIcon from '../assets/circles/red.png';
import blueIcon from '../assets/circles/blue.png';
import goldIcon from '../assets/circles/gold.png';
import { getGoogleMapsApiKey } from './credentials';

const API_KEY = getGoogleMapsApiKey(); // Replace with your Google Maps API key

const MarkerPoints = ({ jsonData, icon }) => {
    const [markers, setMarkers] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            const promises = jsonData.map(async (item) => {
                const location = item.location;

                // Fetch coordinates for location using Google Maps Geocoding API
                const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.status === 'OK' && data.results.length > 0) {
                    const result = data.results[0];
                    const { lat, lng } = result.geometry.location;

                    return {
                        id: item.Telegram_id, // Use Telegram_id as the marker id
                        position: { lat, lng },
                        message: item, // Pass the entire item object as message
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
        const { Telegram_message, GDELT_message, event_breakdown, date } = item;

        if (icon === 'gold') {
            // Render Telegram_message, GDELT_message, and date together for "gold" icon
            return (
                <div>
                    <p className="text-lg font-bold mb-2">Telegram Message:</p>
                    <p className="mb-2">{Telegram_message}</p>
                    <p className="text-lg font-bold mb-2">GDELT Message:</p>
                    <p className="mb-2">{GDELT_message}</p>
                    <p className="text-lg font-bold mb-2">Date:</p>
                    <p>{date}</p>
                </div>
            );
        } else {
            // Render event_breakdown and date for other icons
            return (
                <div>
                    <p className="text-lg font-bold mb-2">Event Breakdown:</p>
                    <p className="mb-2">{event_breakdown}</p>
                    <p className="text-lg font-bold mb-2">Date:</p>
                    <p>{date}</p>
                </div>
            );
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
                        >
                            <div className="p-2">
                                {renderMessage(marker.message)}
                            </div>
                        </InfoWindow>
                    )}
                </Marker>
            ))}
        </>
    );
};

export default MarkerPoints;
