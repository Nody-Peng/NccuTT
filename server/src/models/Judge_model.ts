import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型屬性型別
interface JudgeAttributes {
  judge_id: string;
  meal: boolean;
  is_vegetarian?: boolean;
  bank_account: string;
  fk_user_id: string;
  created_at?: Date;
}

// 定義可選屬性型別，用於創建時
interface JudgeCreationAttributes extends Optional<JudgeAttributes, 'judge_id' | 'is_vegetarian' | 'created_at'> {}

export default (sequelize: Sequelize) => {
  class Judge extends Model<JudgeAttributes, JudgeCreationAttributes> implements JudgeAttributes {
    public judge_id!: string;
    public meal!: boolean;
    public is_vegetarian?: boolean;
    public bank_account!: string;
    public fk_user_id!: string;
    public created_at?: Date;
  }

  Judge.init(
    {
      judge_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      meal: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      is_vegetarian: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      bank_account: {
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'Judge',
      tableName: 'Judges',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false, // 禁用 updatedAt
    }
  );

  return Judge;
};

