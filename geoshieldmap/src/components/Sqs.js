import { getAWSCredentials } from "./credentials"; // Import the getAWSCredentials function to retrieve AWS credentials

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { getSQSURL } from './credentials.js'; // Import credentials functions to get SQS URL

const awsCredentials = getAWSCredentials(); // Retrieve AWS credentials from credentials.js

// Create an SQS client with the AWS credentials and region
const sqsClient = new SQSClient({
    region: awsCredentials.region,
    credentials: awsCredentials.credentials,
});

const queueUrl = `${getSQSURL()}`; // Get the SQS queue URL
let intervalId = null; // Store interval ID for polling
let isListening = false; // Flag to control whether SQS listener is active

// Function to start listening to SQS queue
const listenSqs = async (handleSuccessReceived, uuid, setRelevantMessageReceived) => {
    console.log('Listening to SQS...');
    if (isListening) return; // Return if already listening to avoid multiple listeners

    isListening = true; // Mark as listening

    const pollInterval = 15000; // Polling interval set to 15 seconds

    intervalId = setInterval(async () => {
        try {
            // Create a command to receive messages from the SQS queue
            const command = new ReceiveMessageCommand({
                MaxNumberOfMessages: 1, // Receive a maximum of one message per request
                QueueUrl: queueUrl, // URL of the SQS queue
                WaitTimeSeconds: 20, // Increase wait time for longer polling
            });

            const result = await sqsClient.send(command);

            if (result.Messages && result.Messages.length > 0) {
                const message = result.Messages[0];
                const messageBody = JSON.parse(message.Body); // Parse the message body from JSON

                console.log('Received SQS Message:', messageBody);

                // Access the Subject field from the parsed messageBody
                const subject = messageBody.Subject;
                console.log('Received SQS Subject:', subject);

                if (subject === 'Amazon S3 Notification') {
                    const snsMessage = JSON.parse(messageBody.Message);
                    const objectKey = snsMessage.Records[0].s3.object.key;

                    console.log(snsMessage.Records[0].s3.object.key);
                    console.log(uuid);

                    // Check if the objectKey contains the UUID to identify relevant messages
                    if (objectKey.includes(uuid)) {
                        console.log('Relevant message received:', snsMessage);
                        setRelevantMessageReceived(true); // Update the state variable to indicate relevant message received
                        handleSuccessReceived(uuid); // Trigger callback on success message
                        await deleteMessage(message.ReceiptHandle); // Delete the message from SQS
                        stopListening(); // Stop the polling interval
                    } else {
                        console.log('Received message does not contain the correct UUID, continue listening...');
                    }
                }
            }
        } catch (error) {
            console.error('Error receiving SQS message:', error);
            stopListening(); // Stop the polling interval on error
        }
    }, pollInterval);
};

// Function to delete a message from the SQS queue
const deleteMessage = async (receiptHandle) => {
    const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl, // URL of the SQS queue
        ReceiptHandle: receiptHandle, // Receipt handle of the message to delete
    });

    await sqsClient.send(deleteCommand); // Send the delete command to SQS
};

// Function to stop listening to the SQS queue
const stopListening = () => {
    clearInterval(intervalId); // Clear the interval to stop polling
    isListening = false; // Update the flag to indicate that listening has stopped
};

export default listenSqs; // Export the listenSqs function for use in other modules
