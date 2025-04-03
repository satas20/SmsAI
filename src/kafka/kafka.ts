import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'sms-gpt-producer',
  brokers: ['localhost:29092'],
});

const kafkaProducer = kafka.producer();

const connectKafkaProducer = async () => {
  try {
    await kafkaProducer.connect();
    console.log('Kafka producer connected.');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
  }
};

export { kafkaProducer, connectKafkaProducer };
