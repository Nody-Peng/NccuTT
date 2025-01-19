// src/models/User_model.ts
import { Sequelize, DataTypes, Model, Optional } from 'sequelize'
import bcrypt from 'bcrypt'

interface UserAttributes {
  user_id: string
  is_student: boolean
  phone?: string
  role: 'host' | 'user'
  username: string
  email?: string
  gender: 'M' | 'F'
  password: string
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id'> {}

export default (sequelize: Sequelize) => {
  class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
  {
    public user_id!: string
    public is_student!: boolean
    public phone?: string
    public role!: 'host' | 'user'
    public username!: string
    public email?: string
    public gender!: 'M' | 'F'
    public password!: string
  }

  User.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      is_student: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('host', 'user'),
        allowNull: false,
        defaultValue: 'user',
      },
      username: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('M', 'F'),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'Users',
      sequelize,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  )

  // 密碼加密：在儲存資料之前加密密碼
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(user.password, salt)
    }
  })

  return User
}
