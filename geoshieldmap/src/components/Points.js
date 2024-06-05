import React, { useEffect, useState } from 'react';
import MarkerPoints from './MarkerPoints';
import MarkerPointsMatching from './MarkerPointsMatching';

const Points = ({ categories, startDate, endDate, uuid, setReceivedData }) => {
    const [jsonData, setJsonData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const apiURL = 'https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev';
            let mergedData = { gdelt_articles: [], telegram_messages: [], matching_messages: [] };
    
            if (uuid) {
                try {
                    const url = `${apiURL}/get_custom_data?uuid=${uuid}`;
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
                for (const category of categories) {
                    try {
                        const url = `${apiURL}/get_data?category=${category.value}&start_date=${startDate}&end_date=${endDate}`;
                        console.log(`Fetching data from: ${url}`);
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const responseData = await response.json();
                        mergedData = mergeData(mergedData, responseData,category.value);
                    } catch (error) {
                        console.error('Error fetching category data:', error);
                    }
                }
                console.log('Merged JSON data:', mergedData);
            }
    
            setJsonData(mergedData);
            setReceivedData(true);
        };
    
        fetchData();
    }, [uuid]);



    
    const mergeData = (mergedData, newData, category) => {
        return {
            gdelt_articles: [...mergedData.gdelt_articles, ...(newData.gdelt_articles || [])],
            telegram_messages: [...mergedData.telegram_messages, ...(newData.telegram_messages || [])],
            matching_messages: [
                ...mergedData.matching_messages,
                ...(newData.matching_messages || []).map(message => ({
                    ...message,
                    classification: category
                }))
            ],
        };
    };
    return (
        <div>
            {jsonData ? (
                <>
                    {jsonData.gdelt_articles && <MarkerPoints jsonData={jsonData.gdelt_articles} icon="red" />}
                    {jsonData.telegram_messages && <MarkerPoints jsonData={jsonData.telegram_messages} icon="blue" />}
                    {jsonData.matching_messages && <MarkerPointsMatching jsonData={jsonData.matching_messages} icon="gold" />}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Points;
