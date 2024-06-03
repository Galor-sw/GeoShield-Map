import { getAWSCredentials } from "./credentials"; // Import the getAWSCredentials function

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const awsCredentials = getAWSCredentials(); // Retrieve AWS credentials from credentials.js

const sqsClient = new SQSClient({
    region: awsCredentials.region,
    credentials: awsCredentials.credentials,
});

const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/637423308941/api_queue';
let intervalId = null; // Store interval ID
let isListening = false; // Flag to control the SQS listener

const listenSqs = async (handleSuccessReceived, uuid ,setRelevantMessageReceived) => {
    console.log('Listening to SQS...');
    if (isListening) return; // Return if already listening

    isListening = true; // Start listening

    const pollInterval = 15000; // Polling interval set to 15 seconds

    intervalId = setInterval(async () => {
        try {
            const command = new ReceiveMessageCommand({
                MaxNumberOfMessages: 1,
                QueueUrl: queueUrl,
                WaitTimeSeconds: 20, // Increase wait time for longer polling
            });

            const result = await sqsClient.send(command);

            if (result.Messages && result.Messages.length > 0) {
                const message = result.Messages[0];
                const messageBody = JSON.parse(message.Body);

                console.log('Received SQS Message:', messageBody);

                // Access the Subject field from the parsed messageBody
                const subject = messageBody.Subject;
                console.log('Received SQS Subject:', subject);

                if (subject === 'Amazon S3 Notification') {
                    const snsMessage = JSON.parse(messageBody.Message);
                    const objectKey = snsMessage.Records[0].s3.object.key;

                    console.log(snsMessage.Records[0].s3.object.key)
                    console.log(uuid)
                    if (objectKey.includes(uuid)) {
                        console.log('Relevant message received:', snsMessage);
                        setRelevantMessageReceived(true); // Update the state variable
                        handleSuccessReceived(uuid); // Trigger callback on success message
                        await deleteMessage(message.ReceiptHandle); // Delete the message from SQS
                        stopListening(); // Stop the listener interval
                    } else {
                        console.log('Received message does not contain the correct UUID, continue listening...');
                    }
                }
            }
        } catch (error) {
            console.error('Error receiving SQS message:', error);
            stopListening(); // Stop the listener interval on error
        }
    }, pollInterval);
};

const deleteMessage = async (receiptHandle) => {
    const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
    });

    await sqsClient.send(deleteCommand);
};

const stopListening = () => {
    clearInterval(intervalId); // Clear the interval
    isListening = false; // Update the flag to stop listening
};

export default listenSqs;
