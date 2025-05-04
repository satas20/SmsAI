import { DataTypes, Model } from 'sequelize';

class IyzicoPayment extends Model {
  static table = 'iyzico_payments';
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  };

  static initModel(sequelize: any) {
    IyzicoPayment.init(IyzicoPayment.fields, {
      sequelize,
      tableName: IyzicoPayment.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
    IyzicoPayment.sync({ alter: true });
  }
}

export { IyzicoPayment };
