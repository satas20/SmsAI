import { DataTypes, Model } from 'sequelize';

class User extends Model {
  static table = 'users';
  static fields = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
  };

  static initModel(sequelize: any) {
    User.init(User.fields, {
      sequelize,
      tableName: User.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  }
}

export { User };
