import { Kafka } from 'kafkajs';
import { ResponseService } from '../services/response_service';
import SMSService from '../services/sms_service';
import OpenAIService from '../services/openai_service';
const kafka = new Kafka({
  clientId: 'sms-ai-response-worker',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});

const kafkaConsumer = kafka.consumer({ groupId: 'sms-ai-response-group' });

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
    const openaiService = new OpenAIService();
    const responseService = new ResponseService(openaiService);

    // Listen for messages
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();

          if (value) {
            // Parse the message
            const parsedMessage = JSON.parse(value);

            // Prepare the message to be sent
            const reply = await responseService.prepareReply(parsedMessage);

            const smsService = new SMSService();
            await smsService.sendSMS(
              reply || 'Something went wrong',
              parsedMessage.phoneNumber,
            );
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
