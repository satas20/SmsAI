import AWS from 'aws-sdk';

export class LogManager {
  private cloudWatchLogs: AWS.CloudWatchLogs;
  private logGroupName: string;
  private logStreamName: string;
  private moduleName: string;

  constructor(module: string) {
    // Initialize AWS CloudWatch Logs client
    this.cloudWatchLogs = new AWS.CloudWatchLogs({
      region: process.env.AWS_REGION || 'eu-central-1', // Default to 'us-east-1'
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Set in environment variables
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Set in environment variables
    });

    // Define log group and stream names
    this.logGroupName = process.env.CLOUDWATCH_LOG_GROUP || 'SmsAIBackend';
    this.logStreamName =
      process.env.CLOUDWATCH_LOG_STREAM || `SmsAI-Stream-${Date.now()}`;
    this.moduleName = module;
  }

  /**
   * Initialize the log group and stream in CloudWatch
   */
  public async initialize(): Promise<void> {
    try {
      // Create log group if it doesn't exist
      await this.createLogGroup();

      // Create log stream
      await this.createLogStream();
    } catch (error) {
      console.error('Error initializing CloudWatch Logs:', error);
    }
  }

  /**
   * Log a message to CloudWatch
   * @param level Log level (e.g., 'info', 'warn', 'error')
   * @param message Log message
   */
  public async log(level: string, message: string): Promise<void> {
    try {
      const timestamp = Date.now();
      const logEvents = [
        {
          message: ` [${this.moduleName}] [${level.toUpperCase()}] ${message}`,
          timestamp,
        },
      ];

      const params: AWS.CloudWatchLogs.PutLogEventsRequest = {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents,
      };

      await this.cloudWatchLogs.putLogEvents(params).promise();
    } catch (error) {
      console.error('Error logging to CloudWatch:', error);
    }
  }

  /**
   * Create a log group if it doesn't exist
   */
  private async createLogGroup(): Promise<void> {
    try {
      const params = { logGroupName: this.logGroupName };
      await this.cloudWatchLogs.createLogGroup(params).promise();
    } catch (error: any) {
      if (error.code !== 'ResourceAlreadyExistsException') {
        throw error;
      }
    }
  }

  /**
   * Create a log stream
   */
  private async createLogStream(): Promise<void> {
    try {
      const params = {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
      };
      await this.cloudWatchLogs.createLogStream(params).promise();
    } catch (error) {
      console.error('Error creating log stream:', error);
    }
  }
}
