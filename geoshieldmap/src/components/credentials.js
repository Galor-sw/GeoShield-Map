// Function to return AWS credentials (hardcoded)
const getAWSCredentials = () => {
    return {
        region: "",
        credentials: {
            accessKeyId: "",
            secretAccessKey: "",
        },
    };
};

// Function to return Google Maps API key (hardcoded)
const getGoogleMapsApiKey = () => {
    return "";
};

// Function to return hardcoded map ID
const getMapId = () => {
    return "";
};

// Export the functions
module.exports = {
    getAWSCredentials,
    getGoogleMapsApiKey,
    getMapId,
};
