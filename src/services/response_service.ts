import OpenAIService from './openai_service';
type KafkaMessage = {
  phoneNumber: string;
  jobId: string;
  id: string;
  message: string;
  timestamp: string;
  operator: string;
};

export const processInboundSMS = async (kafkaMessage: KafkaMessage) => {
  try {
    console.log(
      `Response Service: Processing message: ${JSON.stringify(kafkaMessage)}`,
    );

    // Generate a response using OpenAI
    const openai = new OpenAIService();
    const openaiResponse = await openai.createResponse(
      kafkaMessage.message +
        'do web search if needed keep the dont include any links give the response as json text',
    );

    const generatedMessage = openaiResponse;
    if (!generatedMessage) {
      throw new Error('OpenAI did not return a valid response.');
    }

    console.log(`Response Service: Generated message: ${generatedMessage}`);

    // Send the response via SMS
    return generatedMessage;
  } catch (error) {
    console.error('Response Service: Error processing response:', error);
  }
};
