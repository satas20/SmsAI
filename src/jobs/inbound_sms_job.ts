import cron from 'node-cron';
import SMSService from '../services/sms_service';
import { kafkaProducer } from '../kafka/kafka'; // Import Kafka producer
import dotenv from 'dotenv';
import { LogManager } from '../services/log_manager';

dotenv.config();

const smsService = new SMSService();

const runInboundSMSJob = () => {
  // Schedule the job to run every minute
  const logManager = new LogManager('InboundSMSJob');
  cron.schedule('*/10 * * * * *', async () => {
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
      // const incomingMessages = await smsService.getIncomingMessages(
      //   startdate,
      //   enddate,
      // );
      const incomingMessages = await smsService.getIncomingMessages();

      if (!incomingMessages) {
        return;
      }

      // Send each message to Kafka
      type IncomingMessage = {
        id: string;
        gorevId: string;
        kayittar: string;
        mesaj: string;
        operator: string;
        gonderen: string;
      };

      const kafkaMessages = incomingMessages.map(
        (message: IncomingMessage) => ({
          value: JSON.stringify({
            phoneNumber: message.gonderen,
            jobId: message.gorevId,
            id: message.id,
            message: message.mesaj,
            timestamp: message.kayittar,
            operator: message.operator,
          }),
        }),
      );

      await kafkaProducer.send({
        topic: 'sms-inbound',
        messages: kafkaMessages,
      });
    } catch (error: any) {
      logManager.log(
        'error',
        `Error in Inbound SMS job: ${error.message || error}`,
      );
    }
  });
};

export default runInboundSMSJob;
