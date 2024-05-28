import React, { useEffect, useState } from 'react';
import listenSqs from './Sqs';

const IntervalHandler = ({ onSuccessReceived, uuid }) => {
    const [isListening, setIsListening] = useState(true);
    const [relevantMessageReceived, setRelevantMessageReceived] = useState(false);

    useEffect(() => {
        let intervalId = null;

        const handleSuccessReceived = async () => {
            setIsListening(false); // Set listening flag to false upon successful message receipt
            onSuccessReceived(); // Trigger callback on success message
        };

        const startListening = () => {
            intervalId = setInterval(async () => {
                try {
                    if (isListening) {
                        await listenSqs(handleSuccessReceived, uuid, setRelevantMessageReceived);
                    } else {
                        clearInterval(intervalId); // Clear the interval when listening flag is false
                    }
                } catch (error) {
                    console.error('Error listening to SQS:', error);
                    clearInterval(intervalId); // Clear the interval on error
                }
            }, 15000); // Interval time in milliseconds (e.g., 15 seconds)
        };

        startListening(); // Start listening initially

        return () => {
            clearInterval(intervalId); // Cleanup on component unmount
        };
    }, [onSuccessReceived, isListening, uuid]);

    // Render a message based on whether a relevant message has been received
    return relevantMessageReceived ? <p>Relevant message received!</p> : null;
};

export default IntervalHandler;