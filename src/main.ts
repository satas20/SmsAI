import express, { Response } from 'express';
import { PostgresDB } from './db/postgres_service';
import { connectKafkaProducer } from './kafka/kafka';
import runInboundSMSJob from './jobs/inbound_sms_job';
import { startResponseWorker } from './jobs/response_worker';
import router from './routes/auth_routes';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend's URL
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // Allow cookies if needed
  }),
);
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
