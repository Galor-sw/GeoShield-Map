import  { useEffect, useState } from 'react';
import listenSqs from './Sqs';

const IntervalHandler = ({ onSuccessReceived }) => {
    const [isListening, setIsListening] = useState(true);

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
                        await listenSqs(handleSuccessReceived);
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
    }, [onSuccessReceived, isListening]);

    return null; // No rendering needed for this component
};

export default IntervalHandler;
