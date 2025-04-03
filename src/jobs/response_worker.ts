import { Kafka } from 'kafkajs';
import { processInboundSMS } from '../services/response_service';
import SMSService from '../services/sms_service';
const kafka = new Kafka({
  clientId: 'sms-gpt-response-worker',
  brokers: ['localhost:29092'], // Replace with your Kafka broker address
});

const kafkaConsumer = kafka.consumer({ groupId: 'sms-gpt-response-group' });

const startResponseWorker = async () => {
  try {
    // Connect the Kafka consumer
    await kafkaConsumer.connect();
    console.log('Response Worker: Kafka consumer connected.');

    // Subscribe to the topic
    await kafkaConsumer.subscribe({
      topic: 'sms-inbound',
      fromBeginning: true,
    });

    // Listen for messages
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          console.log(`Response Worker: Received message: ${value}`);

          if (value) {
            // Parse the message
            const parsedMessage = JSON.parse(value);
            // Delegate processing to the Response Service
            const response = await processInboundSMS(parsedMessage);
            const smsService = new SMSService();
            await smsService.sendSMS(response, parsedMessage.phoneNumber);
          }
        } catch (error) {
          console.error('Response Worker: Error processing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Response Worker: Error starting Kafka consumer:', error);
  }
};

export { startResponseWorker };
