import { DataTypes, Model } from 'sequelize';

class Subscription extends Model {
  static table = 'subscriptions';
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    webSearch: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };

  static initModel(sequelize: any) {
    Subscription.init(Subscription.fields, {
      sequelize,
      tableName: Subscription.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  }
}

export { Subscription };
