import React, { useEffect, useState, useRef } from 'react';
import { Marker, InfoWindow, useGoogleMap } from '@react-google-maps/api';

// Security Icons
import redSecurityIcon from '../assets/icons/red-security.png';
import blueSecurityIcon from '../assets/icons/blue-security.png';

// Antisemitism Icons
import redAntisemitismIcon from '../assets/icons/red-antisemitism.png';
import blueAntisemitismIcon from '../assets/icons/blue-antisemitism.png';

// Natural Disasters Icons
import redNaturalDisastersIcon from '../assets/icons/red-natural-disasters.png';
import blueNaturalDisastersIcon from '../assets/icons/blue-natural-disasters.png';
import { getGoogleMapsApiKey, getGoogleMapsAPIURL } from './credentials';

// API key for Google Maps API
const API_KEY = getGoogleMapsApiKey(); 

const MarkerPoints = ({ jsonData, icon }) => {
    const [markers, setMarkers] = useState([]); // State to store markers
    const [activeMarker, setActiveMarker] = useState(null); // State to track the currently active marker
    const [showDetails, setShowDetails] = useState(false); // State to toggle details view
    const infoWindowRef = useRef(null); // Ref for InfoWindow
    const map = useGoogleMap(); // Get the map instance

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!jsonData || jsonData.length === 0) {
                console.error("JSON data is empty or undefined.");
                setMarkers([]); // Clear markers if jsonData is empty
                return;
            }

            setMarkers([]); // Clear markers before fetching new coordinates

            // Fetch coordinates for each item in jsonData
            const promises = jsonData.map(async (item) => {
                const location = item.location;
                if (!location) {
                    console.warn(`Location is missing for item with id: ${item.Telegram_id}`);
                    return null; // Skip if location is missing
                }

                const apiUrl = `${getGoogleMapsAPIURL()}/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.status === 'OK' && data.results.length > 0) {
                    const result = data.results[0];
                    const { lat, lng } = result.geometry.location;

                    return {
                        id: item.Telegram_id,
                        position: { lat, lng },
                        message: item,
                        category: item.classification
                    };
                }

                console.warn(`Geocode API returned no results for location: ${location}`);
                return null;
            });

            // Resolve all promises and filter out null results
            const resolvedMarkers = await Promise.all(promises);
            setMarkers(resolvedMarkers.filter(marker => marker !== null));
        };

        fetchCoordinates();
    }, [jsonData]); // Re-fetch coordinates if jsonData changes

    const handleMarkerClick = (marker) => {
        setActiveMarker(marker);
        setShowDetails(false);

        // Center the map on the marker's position
        if (map) {
            map.panTo(marker.position);

            // Get the map's div and its height
            const mapDiv = map.getDiv();
            const mapHeight = mapDiv.offsetHeight;

            // Adjust the map's viewport if the marker is near the top
            const pixelOffset = mapHeight / 4; // Adjust as necessary
            map.panBy(0, -pixelOffset);
        }
    };

    const handleCloseInfoWindow = () => {
        setActiveMarker(null); // Close the InfoWindow
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails); // Toggle details view
    };

    const getMarkerIcon = (iconString, category) => {
        // Determine which icon to use based on the category and iconString
        const security = category === 'security';
        const antisemitism = category === 'antisemitism';
        const naturalDisasters = category === 'natural-disasters';
    
        if (iconString === 'blue') {
            if (security) {
                return blueSecurityIcon;
            } else if (antisemitism) {
                return blueAntisemitismIcon;
            } else if (naturalDisasters) {
                return blueNaturalDisastersIcon;
            }
        } else {
            if (security) {
                return redSecurityIcon;
            } else if (antisemitism) {
                return redAntisemitismIcon;
            } else if (naturalDisasters) {
                return redNaturalDisastersIcon;
            } 
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
        // Render message details or a summary based on showDetails state
        const { event_breakdown, date, title, message, url } = item;
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
    };

    return (
        <>
            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={{
                        url: getMarkerIcon(icon, marker.category),
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
