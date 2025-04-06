import { DataTypes, Model } from 'sequelize';

class OTP extends Model {
  static table = 'otps';
  static fields = {
    otpId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  };

  static initModel(sequelize: any) {
    OTP.init(OTP.fields, {
      sequelize,
      tableName: OTP.table,
      timestamps: true, // Adds createdAt and updatedAt fields
    });
  }
}

export { OTP };
