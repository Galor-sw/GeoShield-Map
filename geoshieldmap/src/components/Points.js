
import React, { useEffect, useState } from 'react';
import MarkerPoints from './MarkerPoints';

const Points = () => {
    const [jsonData, setJsonData] = useState(null); // Initialize jsonData state as null

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/get_data?category=security');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();
                setJsonData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Call the fetchData function when the component mounts
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <div>
            {jsonData ? (
                <>
                    {/* Pass each element of jsonData to separate instances of MarkerPoints */}
                    {jsonData.gdelt_articles && <MarkerPoints jsonData={jsonData.gdelt_articles} icon={"red"}/>}
                    {jsonData.telegram_messages && <MarkerPoints jsonData={jsonData.telegram_messages} icon={"blue"} />}
                    {jsonData.matching_messages && <MarkerPoints jsonData={jsonData.matching_messages} icon={"gold"} />}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Points;
