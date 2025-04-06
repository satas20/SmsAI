import express, { Response } from 'express';
import { PostgresDB } from './db/postgres_service';
import { connectKafkaProducer } from './kafka/kafka';
import runInboundSMSJob from './jobs/inbound_sms_job';
import { startResponseWorker } from './jobs/response_worker';
import SMSService from './services/sms_service';
import router from './routes/auth_routes';
// Initialize Express

// const smsS = new SMSService(); // Initialize the SMS service
// const result = await smsS.sendOTP('12345', '5327613050');

const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use('/auth', router);
// Define a simple health check route
app.get('/health', (req, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Service is running!' });
});

try {
  // Initialize the database
  const db = PostgresDB.getInstance();
  await db.sync();
  console.log('Database synced successfully!');

  // Connect Kafka producer
  await connectKafkaProducer();

  // Start the incoming SMS job
  runInboundSMSJob();
  console.log('Incoming SMS job started.');

  // Start the response worker
  await startResponseWorker();
  console.log('Response worker started.');

  // Start the Express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  console.error('Error starting the application:', err);
}
