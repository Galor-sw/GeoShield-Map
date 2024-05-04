import React, { useEffect, useState } from 'react';
import MarkerPoints from './MarkerPoints';

const Points = ({ startDate, endDate }) => { // Accept startDate and endDate props
    const [jsonData, setJsonData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/get_data?category=security&start_date=${startDate}&end_date=${endDate}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();
                setJsonData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [startDate, endDate]); // Add startDate and endDate to the dependency array

    return (
        <div>
            {jsonData ? (
                <>
                    {jsonData.gdelt_articles && <MarkerPoints jsonData={jsonData.gdelt_articles} icon="red" />}
                    {jsonData.telegram_messages && <MarkerPoints jsonData={jsonData.telegram_messages} icon="blue" />}
                    {jsonData.matching_messages && <MarkerPoints jsonData={jsonData.matching_messages} icon="gold" />}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Points;
