import Netgsm, { SmsInboxPayload } from '@netgsm/sms';
import dotenv from 'dotenv';

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
      const result = await this.netgsm.sendRestSms({
        msgheader: process.env.NETGSM_USERNAME || 'your_netgsm_username', // Replace with your Netgsm message header
        messages: [
          {
            msg: message,
            no: phoneNumber,
          },
        ],
      });
      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
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
      console.error('Error checking balance:', error);
      throw error;
    }
  }

  public async getIncomingMessages(
    startdate: string,
    enddate: string,
  ): Promise<any> {
    try {
      const smsInboxPayload: SmsInboxPayload = {};
      if (startdate) smsInboxPayload.startdate = startdate; // dMMyyyyHHmm
      if (enddate) smsInboxPayload.stopdate = enddate; // dMMyyyyHHmm

      const messages = await this.netgsm.getInbox(smsInboxPayload);
      return messages.messages || []; // Return messages or an empty array if none found
    } catch (error: any) {
      if (error.code !== '40') {
        // Ignore 40 errors no messgaes found
        console.log(
          'Empty inbox startdatestartdate:',
          startdate + ' enddate:',
          enddate,
        );
      } else {
        console.error('Error getting incoming messages:', error);
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
      console.error('Error sending OTP:', error);
      throw error;
    }
  }
}

export default SMSService;
