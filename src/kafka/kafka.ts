import { Kafka } from 'kafkajs';
import { LogManager } from '../services/log_manager';

// Dynamically select the Kafka broker based on the environment
const kafkaBroker =
  process.env.KAFKA_BROKER ||
  // process.env.KAFKA_BROKER_LOCAL ||
  'localhost:29092';
console.log('Kafka broker:', kafkaBroker);

const kafka = new Kafka({
  clientId: 'sms-ai-producer',
  brokers: [kafkaBroker],
});

const kafkaProducer = kafka.producer();
const logManager = new LogManager('KafkaProducer');
const connectKafkaProducer = async () => {
  try {
    await kafkaProducer.connect();
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes('sms-inbound')) {
      await admin.createTopics({
        topics: [
          {
            topic: 'sms-inbound',
            numPartitions: 1,
            replicationFactor: 1,
            configEntries: [
              { name: 'retention.ms', value: '86400000' }, // 1 day in ms
            ],
          },
        ],
      });
    }
    await admin.disconnect();
  } catch (error) {
    logManager.log('error', `Error connecting to Kafka: ${error}`);
  }
};

export { kafkaProducer, connectKafkaProducer };
