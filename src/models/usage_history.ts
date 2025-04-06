import { DataTypes, Model } from 'sequelize';

class UsageHistory extends Model {
  static table = 'usage_history';
  static fields = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    creditsUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
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
