import { DataTypes, Model } from "sequelize";

class UserSubscription extends Model {
  static table = "user_subscriptions";
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
        model: "users",
        key: "id",
      },
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subscriptions",
        key: "id",
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
    remainingCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  };

  static initModel(sequelize: any) {
    UserSubscription.init(UserSubscription.fields, {
      sequelize,
      tableName: UserSubscription.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  }
}

export { UserSubscription };