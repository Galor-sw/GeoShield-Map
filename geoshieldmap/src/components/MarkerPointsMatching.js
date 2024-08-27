import React, { useEffect, useState, useRef } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import goldIconSecurity from '../assets/icons/gold-security.png';
import goldIconAntisemitism from '../assets/icons/gold-antisemitism.png';
import goldIconNaturalDisasters from '../assets/icons/gold-natural-disasters.png';
import { getGoogleMapsApiKey ,getGoogleMapsAPIURL} from './credentials';

// API key for Google Maps API
const API_KEY = getGoogleMapsApiKey(); 
const MAX_ICON_SIZE = 50; // Maximum size for the icon

const MarkerPointsMatching = ({ jsonData, icon }) => {
    const [markers, setMarkers] = useState([]); // State to store marker data
    const [activeMarker, setActiveMarker] = useState(null); // State to track the currently active marker
    const [showDetails, setShowDetails] = useState(false); // State to toggle details view
    const infoWindowRef = useRef(null); // Ref for InfoWindow

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!jsonData || jsonData.length === 0) {
                console.log("JSON data is empty or undefined.");
                return;
            }

            const allPromises = [];

            // Iterate over each item in jsonData
            jsonData.forEach(item => {
                const category = item.classification; // Category of the item
                const keys = Object.keys(item);

                // Iterate over each key in the item
                keys.forEach(key => {
                    const entry = item[key];
                    if (!entry || !entry.location) {
                        console.warn(`Location is missing for key: ${key}`);
                        return; // Skip this entry if location is missing
                    }

                    const location = entry.location;
                    const apiUrl = `${getGoogleMapsAPIURL()}/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;

                    // Fetch coordinates for the location
                    const promise = fetch(apiUrl)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Geocode API request failed for location: ${location}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.status === 'OK' && data.results.length > 0) {
                                const result = data.results[0];
                                const { lat, lng } = result.geometry.location;
                                return {
                                    id: key,
                                    position: { lat, lng },
                                    messages: entry.messages,
                                    final_score: entry.final_score,
                                    category: category // Add category to marker
                                };
                            }
                            console.warn(`Geocode API returned no results for location: ${location}`);
                            return null;
                        })
                        .catch(error => {
                            console.error(`Error fetching coordinates for location: ${location}`, error);
                            return null;
                        });

                    allPromises.push(promise);
                });
            });

            // Resolve all promises and filter out null results
            const resolvedMarkers = await Promise.all(allPromises);
            setMarkers(resolvedMarkers.filter(marker => marker !== null));
        };

        fetchCoordinates();
    }, [jsonData, icon]); // Re-fetch coordinates if jsonData or icon changes

    const handleMarkerClick = (marker) => {
        setActiveMarker(marker); // Set the clicked marker as active
        setShowDetails(false); // Close details view on marker click
    };

    const handleCloseInfoWindow = () => {
        setActiveMarker(null); // Close the InfoWindow
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails); // Toggle details view
    };

    const getMarkerIcon = (category, score) => {
        const size = Math.max(10, MAX_ICON_SIZE * score); // Minimum size set to 10 for visibility
        let iconUrl;
        console.log("category:", category);
        switch (category) {
            case 'security':
                iconUrl = goldIconSecurity;
                break;
            case 'antisemitism':
                iconUrl = goldIconAntisemitism;
                break;
            case 'natural-disasters':
                iconUrl = goldIconNaturalDisasters;
                break;
            default:
                console.warn(`Unknown category: ${category}`);
                iconUrl = ''; // Set a default icon URL or handle the unknown category case
                break;
        }

        return {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(size, size), // Scale the icon size
        };
    };

    const handleOutsideClick = (event) => {
        if (infoWindowRef.current && !infoWindowRef.current.contains(event.target)) {
            setActiveMarker(null); // Close the InfoWindow if click is outside
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick); // Add event listener to handle clicks outside the InfoWindow

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick); // Clean up event listener on component unmount
        };
    }, []);

    const renderMessage = (messages, final_score) => {
        return messages.map((msg, index) => (
            <div key={index}>
                <p className="text-lg font-bold mb-2">{msg.source} Message:</p>
                <p className="mb-2">{msg.message}</p>
                <p className="text-gray-500 mb-2">{msg.date}</p>
                {msg.url && (
                    <p>
                        <a href={msg.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold">Link</a>
                        <br />
                        <br />
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
                    icon={getMarkerIcon(marker.category, marker.final_score)}
                    onClick={() => handleMarkerClick(marker)}
                >
                    {activeMarker === marker && (
                        <InfoWindow position={marker.position}
                            onCloseClick={handleCloseInfoWindow}
                        >
                            <div ref={infoWindowRef}>
                                {renderMessage(marker.messages, marker.final_score)}
                                <p className="text-black-500 mb-2 text-l font-bold">Final Score: {marker.final_score.toFixed(2)}</p>
                            </div>
                        </InfoWindow>
                    )}
                </Marker>
            ))}
        </>
    );
};

export default MarkerPointsMatching;
