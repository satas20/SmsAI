import { DataTypes, Model } from 'sequelize';

class UserSubscriptionLog extends Model {
  static table = 'user_subscriptions_log';
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  };

  static initModel(sequelize: any) {
    UserSubscriptionLog.init(UserSubscriptionLog.fields, {
      sequelize,
      tableName: UserSubscriptionLog.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  }
}

export { UserSubscriptionLog };
