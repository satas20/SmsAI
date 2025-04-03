import { PostgresDB } from './db/postgres_service';
import { connectKafkaProducer } from './kafka/kafka';
import runInboundSMSJob from './jobs/inbound_sms_job';
import { startResponseWorker } from './jobs/response_worker';

(async () => {
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

    await startResponseWorker();
    console.log('Response worker started.');
  } catch (err) {
    console.error('Error starting the application:', err);
  }
})();
