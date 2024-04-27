import React, { useEffect, useState, useRef } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import redIcon from '../assets/icons/red.png';
import blueIcon from '../assets/icons/blue.png';
import goldIcon from '../assets/icons/gold.png';
import { getGoogleMapsApiKey } from './credentials';

const API_KEY = getGoogleMapsApiKey(); // Replace with your Google Maps API key

const MarkerPoints = ({ jsonData, icon }) => {
    const [markers, setMarkers] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const infoWindowRef = useRef(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            const promises = jsonData.map(async (item) => {
                const location = item.location;

                const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.status === 'OK' && data.results.length > 0) {
                    const result = data.results[0];
                    const { lat, lng } = result.geometry.location;

                    return {
                        id: item.Telegram_id,
                        position: { lat, lng },
                        message: item,
                        type: item.type
                    };
                }

                return null;
            });

            const resolvedMarkers = await Promise.all(promises);
            setMarkers(resolvedMarkers.filter(marker => marker !== null));
        };

        if (jsonData.length > 0) {
            fetchCoordinates();
        }
    }, [jsonData]);

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

    const handleOutsideClick = (event) => {
        // Check if the click is outside the InfoWindow
        if (infoWindowRef.current && !infoWindowRef.current.contains(event.target)) {
            setActiveMarker(null); // Close the InfoWindow
        }
    };

    useEffect(() => {
        // Add event listener to handle clicks outside the InfoWindow
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            // Clean up event listener when component unmounts
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const renderMessage = (item) => {
        const { Telegram_message, GDELT_message, event_breakdown, date, title, message, url } = item;

        if (icon === 'gold') {
            return (
                <div>
                    <p className="text-lg font-bold mb-2">Telegram Message:</p>
                    <p className="mb-2">{Telegram_message}</p>
                    <p className="text-lg font-bold mb-2">GDELT Message:</p>
                    <p className="mb-2">{GDELT_message}</p>
                </div>
            );
        } else {
            if (showDetails) {
                return (
                    <div>
                        <p className="text-lg font-bold mb-2">{title}</p>
                        <p className="mb-2">{message}</p>
                        {url && (
                            <p>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold">Link</a>
                            </p>
                        )}
                        <p className="text-gray-500 mb-2">{date}</p>
                        <div className="text-center">
                            <button className="text-blue-500" onClick={toggleDetails}>Read Less...</button>
                        </div>
                    </div>
                );
            } else {
                // Split event_breakdown string by newline character '\n' and map each part to a paragraph
                const breakdownParts = event_breakdown.split('\n');
                const breakdownParagraphs = breakdownParts.map((part, index) => (
                    <p key={index} className="mb-2">{part}</p>
                ));
                return (
                    <div>
                        <p className="mb-2">{breakdownParagraphs}</p>
                        <p className="text-gray-500 mb-2">{date}</p>
                        <div className="text-center">
                            <button className="text-blue-500" onClick={toggleDetails}>Read More...</button>
                        </div>
                    </div>
                );
            }
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
                            <div ref={infoWindowRef}>
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
