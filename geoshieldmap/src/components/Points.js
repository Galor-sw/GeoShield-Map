import React, { useEffect, useState } from 'react';
import MarkerPoints from './MarkerPoints';
import MarkerPointsMatching from './MarkerPointsMatching';
import { getAPIAWS } from './credentials.js'; // Import credentials functions

const Points = ({ categories, startDate, endDate, uuid, setReceivedData, getData }) => {
    const [jsonData, setJsonData] = useState(null); // State to store fetched JSON data

    useEffect(() => {
        if (getData === true) {
            const fetchData = async () => {
                let mergedData = { gdelt_articles: [], telegram_messages: [], matching_messages: [] };

                // If UUID is provided, fetch custom data
                if (uuid) {
                    try {
                        const url = `${getAPIAWS()}/get_custom_data?uuid=${uuid}`;
                        console.log(`Fetching data from: ${url}`);
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error('Failed to fetch data');
                        }
                        const data = await response.json();
                        mergedData = mergeData(mergedData, data);
                        console.log('Fetched data:', data);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                } else {
                    // Fetch data for each category separately
                    console.log(`${getAPIAWS()}`);
                    for (const category of categories) {
                        try {
                            const url = `${getAPIAWS()}/get_data?category=${category.value}&start_date=${startDate}&end_date=${endDate}`;
                            console.log(`Fetching data from: ${url}`);
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            const responseData = await response.json();
                            mergedData = mergeData(mergedData, responseData, category.value);
                        } catch (error) {
                            console.error('Error fetching category data:', error);
                        }
                    }
                    console.log('Merged JSON data:', mergedData);
                }

                // Update state with the fetched data
                setJsonData(mergedData);
                setReceivedData(true); // Notify that data has been received
            };

            fetchData();
        }
    }, [uuid, getData]); // Dependencies for useEffect: UUID and getData

    // Function to merge new data into existing data
    const mergeData = (mergedData, newData, category) => {
        return {
            gdelt_articles: [...mergedData.gdelt_articles, ...(newData.gdelt_articles || [])],
            telegram_messages: [...mergedData.telegram_messages, ...(newData.telegram_messages || [])],
            matching_messages: [
                ...mergedData.matching_messages,
                ...(newData.matching_messages || []).map(message => ({
                    ...message,
                    classification: category // Add classification to messages
                }))
            ],
        };
    };

    return (
        <div>
            {jsonData ? (
                <>
                    {/* Render MarkerPoints component for GDELT articles */}
                    {jsonData.gdelt_articles && <MarkerPoints jsonData={jsonData.gdelt_articles} icon="red" />}
                    {/* Render MarkerPoints component for Telegram messages */}
                    {jsonData.telegram_messages && <MarkerPoints jsonData={jsonData.telegram_messages} icon="blue" />}
                    {/* Render MarkerPointsMatching component for matching messages */}
                    {jsonData.matching_messages && <MarkerPointsMatching jsonData={jsonData.matching_messages} icon="gold" />}
                </>
            ) : (
                <p>Loading...</p> // Show loading text while data is being fetched
            )}
        </div>
    );
};

export default Points;
