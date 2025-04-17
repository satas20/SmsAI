import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'sms-ai-producer',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
});
console.log('Kafka broker:', process.env.KAFKA_BROKER || 'kafka:9092');

const kafkaProducer = kafka.producer();

const connectKafkaProducer = async () => {
  try {
    await kafkaProducer.connect();
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes('inbound-sms')) {
      await admin.createTopics({
        topics: [
          { topic: 'inbound-sms', numPartitions: 1, replicationFactor: 1 },
        ],
      });
      console.log('Created inbound-sms topic');
    }
    await admin.disconnect();
    console.log('Kafka producer connected.');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
  }
};

export { kafkaProducer, connectKafkaProducer };
