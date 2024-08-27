import React, { useEffect, useState } from 'react';
import listenSqs from './Sqs';

/**
 * IntervalHandler Component
 * 
 * This component manages periodic checks to an SQS queue for relevant messages.
 * It uses an interval to repeatedly call the listenSqs function and handles the response.
 *
 * @param {Object} props
 * @param {Function} props.handleSuccessReceivedHeader - Callback function to be called when a success message is received
 * @param {string} props.uuid - Unique identifier for the current session or request
 */
const IntervalHandler = ({ handleSuccessReceivedHeader, uuid }) => {
    // State to control whether the component should continue listening
    const [isListening, setIsListening] = useState(true);
    // State to track if a relevant message has been received
    const [relevantMessageReceived, setRelevantMessageReceived] = useState(false);

    useEffect(() => {
        let intervalId = null;

        /**
         * Handles the receipt of a success message
         * @param {string} uuid - The UUID of the received message
         */
        const handleSuccessReceived = async (uuid) => {
            setIsListening(false); // Stop listening when a success message is received
            handleSuccessReceivedHeader(uuid); // Call the parent component's callback
        };

        /**
         * Starts the interval for listening to the SQS queue
         */
        const startListening = () => {
            intervalId = setInterval(async () => {
                try {
                    if (isListening) {
                        // Call the listenSqs function with necessary callbacks and uuid
                        await listenSqs(handleSuccessReceived, uuid, setRelevantMessageReceived);
                    } else {
                        clearInterval(intervalId); // Stop the interval if isListening is false
                    }
                } catch (error) {
                    console.error('Error listening to SQS:', error);
                    clearInterval(intervalId); // Stop the interval on error
                }
            }, 15000); // Check every 15 seconds
        };

        startListening(); // Start the listening process

        // Cleanup function to clear the interval when the component unmounts
        return () => {
            clearInterval(intervalId);
        };
    }, [isListening, uuid, handleSuccessReceivedHeader]);

    // The component doesn't render anything visible
    return null;
};

export default IntervalHandler;