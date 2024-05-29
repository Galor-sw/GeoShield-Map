import React, { useEffect, useState } from 'react';
import MarkerPoints from './MarkerPoints';
import MarkerPointsMatching from './MarkerPointsMatching';

const Points = ({category, startDate, endDate, uuid ,setReceivedData}) => {
    const [jsonData, setJsonData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            let url;
            const apiURL='https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev';
            if (uuid)
                url = `${apiURL}/get_custom_data?uuid=${uuid}`;
            else
                url = `${apiURL}/get_data?category=${category}&start_date=${startDate}&end_date=${endDate}`;

            console.log(`Fetching data from: ${url}`);
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setJsonData(data);
                console.log('Fetched data:', data); // Log data after fetching and setting state
                setReceivedData(true);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); 
    }, [category, startDate, endDate ,uuid]);

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