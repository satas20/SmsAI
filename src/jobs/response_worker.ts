import { Kafka } from 'kafkajs';
import { ResponseService } from '../services/response_service';
import SMSService from '../services/sms_service';
import AIService from '../services/ai_service';
import { LogManager } from '../services/log_manager';
const kafka = new Kafka({
  clientId: 'sms-ai-response-worker',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});

const kafkaConsumer = kafka.consumer({ groupId: 'sms-ai-response-group' });
const logManager = new LogManager('ResponseWorker');
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
    const openaiService = new AIService();
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
          logManager.log(
            'error',
            `Error processing message: ${error} - Message: ${message.value?.toString()}`,
          );
        }
      },
    });
  } catch (error) {
    logManager.log('error', `Error starting response worker: ${error}`);
  }
};

export { startResponseWorker };
