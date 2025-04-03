import { DataTypes, Model } from "sequelize";

class User extends Model {
  static table = "users";
  static fields = {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  };

  static initModel(sequelize: any) {
    User.init(User.fields, {
      sequelize,
      tableName: User.table,
      timestamps: true,
    });
  }
}

export { User };
