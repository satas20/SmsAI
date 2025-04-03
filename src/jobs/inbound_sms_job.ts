import cron from 'node-cron';
import SMSService from '../services/sms_service';
import { kafkaProducer } from '../kafka/kafka'; // Import Kafka producer
import dotenv from 'dotenv';

dotenv.config();

const smsService = new SMSService();

const runInboundSMSJob = () => {
  // Schedule the job to run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Running incoming SMS job...');

    try {
      // Fetch incoming messages from NetGSM
      const formatDate = (date: Date) => {
        return date
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .replace(/[/,: ]/g, '');
      };

      const startdate = formatDate(new Date(Date.now() - 60 * 1000)); // 1 minute ago
      const enddate = formatDate(new Date()); // Now
      const incomingMessages = await smsService.getIncomingMessages(
        startdate,
        enddate,
      );

      if (incomingMessages.length === 0) {
        console.log('No new incoming messages.');
        return;
      }

      console.log(`Fetched ${incomingMessages.length} incoming messages.`);

      // Send each message to Kafka
      type IncomingMessage = {
        id: string;
        gorevId: string;
        kayittar: string;
        mesaj: string;
        operator: string;
        gonderen: string;
      };

      for (const message of incomingMessages) {
        const kafkaMessage = {
          phoneNumber: message.gonderen,
          jobId: message.gorevId,
          id: message.id,
          message: message.mesaj,
          timestamp: message.kayittar,
          operator: message.operator,
        };

        await kafkaProducer.send({
          topic: 'sms-inbound',
          messages: [{ value: JSON.stringify(kafkaMessage) }],
        });

        console.log(`Sent message to Kafka: ${JSON.stringify(kafkaMessage)}`);
      }
    } catch (error: any) {
      console.error('Error in incoming SMS job:', error);
    }
  });
};

export default runInboundSMSJob;
