const apiKey = 'AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU';

const getCoordinates = async (locationName) => {
    console.log(locationName);
    const encodedLocation = encodeURIComponent(locationName);
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        return { lat, lng };
    } else {
        throw new Error('Location not found');
    }
};

// Call the mergeJsons function to merge JSON files and save the result


export default getCoordinates;
