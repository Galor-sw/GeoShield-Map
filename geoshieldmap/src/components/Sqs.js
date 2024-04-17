import { configObject } from "./credentials";
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient(configObject);
const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/637423308941/api_queue';
let intervalId = null; // Store interval ID
let isListening = false; // Flag to control the SQS listener

const listenSqs = async (onSuccessReceived) => {
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
                    onSuccessReceived(); // Trigger callback on success message
                    await deleteMessage(message.ReceiptHandle); // Delete the message from SQS
                    stopListening(); // Stop the listener interval
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
