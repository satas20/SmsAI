import { Sequelize } from 'sequelize';
import {
  User,
  OTP,
  UsageHistory,
  Subscription,
  UserSubscription,
  UserSubscriptionLog,
} from '../index';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.POSTGRES_HOST;
const username = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const database = process.env.POSTGRES_DB;
const port = parseInt(process.env.POSTGRES_PORT as string, 10);

class PostgresDB {
  private static instance: any;
  private sequelize: any;

  private constructor() {
    this.sequelize = new Sequelize({
      host,
      port,
      username,
      password,
      database,
      dialect: 'postgres',
      logging: false,
    });

    this.initializeModels();
  }

  public static getInstance(): PostgresDB {
    if (!PostgresDB.instance) {
      PostgresDB.instance = new PostgresDB();
    }
    return PostgresDB.instance;
  }

  public getSequelize(): typeof Sequelize {
    return this.sequelize;
  }

  private async initializeModels() {
    const models = [
      User,
      OTP,
      UsageHistory,
      Subscription,
      UserSubscription,
      UserSubscriptionLog,
    ]; // Add all models here
    for (const model of models) {
      await model.initModel(this.sequelize);
    }
    const SubCount = await Subscription.findAll({});
    if (SubCount.length === 0) {
      await Subscription.create({
        id: 1,
        name: 'Free',
        price: 0.0,
        credits: 10,
        webSearch: false,
        createdAt: new Date('2025-04-17 15:08:02.824'),
        updatedAt: new Date('2025-04-17 15:08:02.824'),
      });
    }
  }

  public async sync(): Promise<void> {
    await this.sequelize.sync({ force: true });
  }
}

export { PostgresDB };
