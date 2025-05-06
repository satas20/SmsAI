import { Kafka } from 'kafkajs';

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

const connectKafkaProducer = async () => {
  try {
    await kafkaProducer.connect();
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes('sms-inbound')) {
      await admin.createTopics({
        topics: [
          { topic: 'sms-inbound', numPartitions: 1, replicationFactor: 1 },
        ],
      });
      console.log('Created sms-inboundtopic');
    }
    await admin.disconnect();
    console.log('Kafka producer connected.');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
  }
};

export { kafkaProducer, connectKafkaProducer };
