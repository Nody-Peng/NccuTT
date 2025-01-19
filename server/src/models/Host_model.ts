import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型屬性型別
interface HostAttributes {
  host_id: string;
  host_name: string;
  fk_user_id: string;
}

// 定義可選屬性型別，用於創建時
interface HostCreationAttributes extends Optional<HostAttributes, 'host_id'> {}

export default (sequelize: Sequelize) => {
  class Host extends Model<HostAttributes, HostCreationAttributes> implements HostAttributes {
    public host_id!: string;
    public host_name!: string;
    public fk_user_id!: string;
  }

  Host.init(
    {
      host_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      host_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fk_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Host',
      tableName: 'Host',
      timestamps: false, // 不需要 createdAt 和 updatedAt
    }
  );

  return Host;
};

