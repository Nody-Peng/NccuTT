import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型屬性型別
interface JudgeInfoAttributes {
  judge_info_id: string;
  wage?: number;
  fk_judge_id: string;
}

// 定義可選屬性型別，用於創建時
interface JudgeInfoCreationAttributes extends Optional<JudgeInfoAttributes, 'judge_info_id'> {}

export default (sequelize: Sequelize) => {
  class JudgeInfo extends Model<JudgeInfoAttributes, JudgeInfoCreationAttributes> implements JudgeInfoAttributes {
    public judge_info_id!: string;
    public wage?: number;
    public fk_judge_id!: string;
  }

  JudgeInfo.init(
    {
      judge_info_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      wage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      fk_judge_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Judges',
          key: 'judge_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'JudgeInfo',
      tableName: 'Judge_info',
      timestamps: false, // 不需要 createdAt 和 updatedAt
    }
  );

  return JudgeInfo;
};

