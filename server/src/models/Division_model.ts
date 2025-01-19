import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型屬性型別
interface DivisionAttributes {
  division_id: string;
  division_name: string;
  division_type: 'social' | 'college'; // ENUM 類型
  fk_tournament_id: string;
}

// 創建一個可選屬性接口，適用於創建時不需要所有字段的情況
interface DivisionCreationAttributes extends Optional<DivisionAttributes, 'division_id'> {}

export default (sequelize: Sequelize) => {
  class Division extends Model<DivisionAttributes, DivisionCreationAttributes>
    implements DivisionAttributes {
    public division_id!: string;
    public division_name!: string;
    public division_type!: 'social' | 'college';
    public fk_tournament_id!: string;
  }

  Division.init(
    {
      division_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      division_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      division_type: {
        type: DataTypes.ENUM('social', 'college'),
        allowNull: false,
      },
      fk_tournament_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tournaments',
          key: 'tournament_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Division',
      tableName: 'Divisions',
      timestamps: false, // 不需要 `createdAt` 和 `updatedAt`
    }
  );

  return Division;
};

