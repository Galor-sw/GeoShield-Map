// import React, { useEffect, useState } from 'react';
// import jsonData from '../assets/Data/data.json';
// import MarkerPoints from './MarkerPoints';

// const Points = () => {
//     const [data, setData] = useState([]);

//     useEffect(() => {
//         // Load JSON data into state
//         setData(jsonData);
//     }, []);

//     return (
//         <div>
//             <MarkerPoints jsonData={jsonData} />
//         </div>
//     );
// }

// export default Points;


import React, { useEffect, useState } from 'react';
import MarkerPoints from './MarkerPoints';

const Points = () => {
    const [telegramMessages, setTelegramMessages] = useState(null); // Initialize telegramMessages state as null

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://bxjdwomca6.execute-api.eu-west-1.amazonaws.com/dev/get_data?category=security');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();

                // Extract the telegram_messages array from the fetched JSON data
                const { telegram_messages } = jsonData;

                setTelegramMessages(telegram_messages);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Call the fetchData function when the component mounts
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <div>
            {telegramMessages ? (
                <MarkerPoints jsonData={telegramMessages} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Points;
