import React, { useEffect, useState, useRef } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import redIcon from '../assets/icons/red.png';
import blueIcon from '../assets/icons/blue.png';
import goldIcon from '../assets/icons/gold.png';
import { getGoogleMapsApiKey } from './credentials';

const API_KEY = getGoogleMapsApiKey(); // Replace with your Google Maps API key
const MAX_ICON_SIZE = 50; // Maximum size for the icon

const MarkerPointsMatching = ({ jsonData, icon }) => {
    const [markers, setMarkers] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const infoWindowRef = useRef(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            jsonData.forEach(async item => {
                const keys = Object.keys(item);
                const promises = keys.map(async (key) => {
                    const location = item[key].location;
                    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    if (data.status === 'OK' && data.results.length > 0) {
                        const result = data.results[0];
                        const { lat, lng } = result.geometry.location;
                        return {
                            id: key,
                            position: { lat, lng },
                            messages: item[key].messages,
                            final_score: item[key].final_score
                        };
                    }
                    return null;
                });

                const resolvedMarkers = await Promise.all(promises);
                setMarkers(resolvedMarkers.filter(marker => marker !== null));
            });
        };

        if (jsonData.length > 0) {
            fetchCoordinates();
        }
    }, [jsonData, icon]);

    const handleMarkerClick = (marker) => {
        setActiveMarker(marker);
        setShowDetails(false);
    };

    const handleCloseInfoWindow = () => {
        setActiveMarker(null);
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const getMarkerIcon = (iconString, score) => {
        const size = Math.max(10, MAX_ICON_SIZE * score); // Minimum size set to 10 for visibility
        switch (iconString) {
            case 'gold':
                return {
                    url: goldIcon,
                    scaledSize: new window.google.maps.Size(size, size),
                };
            case 'blue':
                return {
                    url: blueIcon,
                    scaledSize: new window.google.maps.Size(size, size),
                };
            case 'red':
            default:
                return {
                    url: redIcon,
                    scaledSize: new window.google.maps.Size(size, size),
                };
        }
    };

    const handleOutsideClick = (event) => {
        if (infoWindowRef.current && !infoWindowRef.current.contains(event.target)) {
            setActiveMarker(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const renderMessage = (messages) => {
        return messages.map((msg, index) => (
            <div key={index}>
                <p className="text-lg font-bold mb-2">{msg.source} Message:</p>
                <p className="mb-2">{msg.message}</p>
                <p className="text-gray-500 mb-2">{msg.date}</p>
                {msg.url && (
                    <p>
                        <a href={msg.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold">Link</a>
                    </p>
                )}
            </div>
        ));
    };

    return (
        <>
            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={getMarkerIcon(icon, marker.final_score)}
                    onClick={() => handleMarkerClick(marker)}
                >
                    {activeMarker === marker && (
                        <InfoWindow position={marker.position}
                            onCloseClick={handleCloseInfoWindow}
                        >
                            <div ref={infoWindowRef}>
                                {renderMessage(marker.messages)}
                                <p className="text-gray-500 mb-2">Final Score: {marker.final_score.toFixed(2)}</p>
                            </div>
                        </InfoWindow>
                    )}
                </Marker>
            ))}
        </>
    );
};

export default MarkerPointsMatching;
