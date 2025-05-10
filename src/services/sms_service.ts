import Netgsm, { SmsInboxPayload } from '@netgsm/sms';
import dotenv from 'dotenv';
import { MAX_SMS_LENGTH } from '../utils/constants';
import { LogManager } from './log_manager';
const MAX_RETRIES = 3;
const logManager = new LogManager('SMSService');
class SMSService {
  private netgsm: Netgsm;

  constructor() {
    this.netgsm = new Netgsm({
      username: process.env.NETGSM_USERNAME || 'your_netgsm_username', // Replace with your Netgsm username
      password: process.env.NETGSM_PASSWORD || 'your_netgsm_password', // Replace with your Netgsm password
    });
  }

  public async sendSMS(message: string, phoneNumber: string): Promise<any> {
    try {
      if (!message) throw new Error('Message cannot be empty');

      let messages = [];

      if (message.length > MAX_SMS_LENGTH) {
        let remainingText = message;
        while (remainingText.length > 0) {
          let splitIndex = MAX_SMS_LENGTH;

          if (remainingText.length > MAX_SMS_LENGTH) {
            // Find the last space before MAX_LENGTH
            splitIndex = remainingText.lastIndexOf(' ', MAX_SMS_LENGTH);
            if (splitIndex === -1) splitIndex = MAX_SMS_LENGTH;
          }

          messages.push(remainingText.slice(0, splitIndex).trim());
          remainingText = remainingText.slice(splitIndex).trim();
        }
      } else {
        messages.push(message);
      }
      const formatedMessages = messages.map((msg) => ({
        msg,
        no: phoneNumber,
      }));
      await formatedMessages.forEach(async (msg) => {
        let retry = 0;
        try {
          const result = await this.netgsm.sendRestSms({
            msgheader: process.env.NETGSM_USERNAME || 'your_netgsm_username',
            appname: 'SmsAI',
            messages: [msg],
          });
        } catch (error) {
          logManager.log('error', `Error sending SMS: ${error}`);
          retry++;
          if (retry < MAX_RETRIES) {
            logManager.log('info', `Retrying to send SMS... Attempt: ${retry}`);
            await this.netgsm.sendRestSms({
              msgheader: process.env.NETGSM_USERNAME || 'your_netgsm_username',
              appname: 'SmsAI',
              messages: [msg],
            });
          } else {
            throw error;
          }
        }
      });

      //Doestn work for now
      // const result = await this.netgsm.sendRestSms({
      //   msgheader: process.env.NETGSM_USERNAME || 'your_netgsm_username',
      //   appname: 'SmsAI',
      //   messages: formatedMessages,
      // });
      return true;
    } catch (error) {
      logManager.log('error', `Error sending SMS: ${error}`);
      throw error;
    }
  }

  public async checkBalance(): Promise<any> {
    try {
      const balance = await this.netgsm.checkBalance({
        stip: 1, // 1 for balance, 2 for package
      });
      return balance;
    } catch (error) {
      logManager.log('error', `Error checking balance: ${error}`);
      throw error;
    }
  }

  public async getIncomingMessages(
    startdate?: string,
    enddate?: string,
  ): Promise<any> {
    try {
      const smsInboxPayload: SmsInboxPayload = {};
      if (startdate) smsInboxPayload.startdate = startdate; // dMMyyyyHHmm
      if (enddate) smsInboxPayload.stopdate = enddate; // dMMyyyyHHmm

      const messages = await this.netgsm.getInbox(smsInboxPayload);
      return messages.messages || []; // Return messages or an empty array if none found
    } catch (error: any) {
      if (error.code === '40') {
        // Ignore 40 errors no messgaes found
      } else {
        logManager.log('error', `Error fetching incoming messages: ${error}`);
        throw error;
      }
    }
  }
  public async sendOTP(
    message: string,
    phoneNumber: string,
    appKey?: string,
  ): Promise<any> {
    try {
      const xmlData = `<?xml version="1.0"?>
  <mainbody>
     <header>
         <usercode>${process.env.NETGSM_USERNAME}</usercode>
         <password>${process.env.NETGSM_PASSWORD}</password>
         <msgheader>${process.env.NETGSM_USERNAME}</msgheader>
         ${appKey ? `<appkey>${appKey}</appkey>` : ''}
     </header>
     <body>
         <msg><![CDATA[${message}]]></msg>
         <no>${phoneNumber}</no>
     </body>
  </mainbody>`;

      const response = await fetch('https://api.netgsm.com.tr/sms/send/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: xmlData,
      });

      const result = await response.text();
      return result;
    } catch (error) {
      logManager.log('error', `Error sending OTP: ${error}`);
      throw error;
    }
  }
}

export default SMSService;
