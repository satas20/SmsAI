import express, { Response } from 'express';
import { PostgresDB } from './db/postgres_service';
import { connectKafkaProducer } from './kafka/kafka';
import runInboundSMSJob from './jobs/inbound_sms_job';
import { startResponseWorker } from './jobs/response_worker';
import authRouter from './routes/auth_routes';
import dashBoardRouter from './routes/dashboard_routes';
import purchaseRouter from './routes/purchase_routes'; // Assuming you have a purchase router
import requestIp from 'request-ip'; // Middleware to get client IP address
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file
const app = express();
app.use(requestIp.mw());
const allowedOrigins = [
  'http://localhost:3002',
  'http://172.19.48.1:3002',
  'https://smsaifrontend-e3b0f8d6192d.herokuapp.com',
  'https://smsai.site',
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Origin:', origin); // Log the origin of the request
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);
app.use(express.json()); // Middleware to parse JSON requests
app.use('/auth', authRouter);
app.use('/dashboard', dashBoardRouter);
app.use('/purchase', purchaseRouter); // Assuming you have a purchase router
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
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  console.error('Error starting the application:', err);
}
