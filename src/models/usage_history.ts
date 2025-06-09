import { DataTypes, Model } from 'sequelize';

class UsageHistory extends Model {
  static table = 'usage_history';
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
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'phoneNumber',
      },
    },
    creditsUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  };

  static initModel(sequelize: any) {
    UsageHistory.init(UsageHistory.fields, {
      sequelize,
      tableName: UsageHistory.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  }
}

export { UsageHistory };
