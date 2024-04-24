// Function to return AWS credentials (hardcoded)
const getAWSCredentials = () => {
    return {
        region: "eu-west-1",
        credentials: {
            accessKeyId: "AKIAZI2LD2CGWD47VQOM",
            secretAccessKey: "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",
        },
    };
};

// Function to return Google Maps API key (hardcoded)
const getGoogleMapsApiKey = () => {
    return "AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU";
};

// Function to return hardcoded map ID
const getMapId = () => {
    return "your_map_id";
};

// Export the functions
module.exports = {
    getAWSCredentials,
    getGoogleMapsApiKey,
    getMapId,
};
