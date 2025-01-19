import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型的屬性型別
interface TournamentAttributes {
  tournament_id: string;
  location: string;
  info?: string;
  tournament_name: string;
  start_date: Date;
  end_date: Date;
  fk_host_id: string;
}

// 創建一個可選屬性接口，適用於創建時不需要所有字段的情況
interface TournamentCreationAttributes
  extends Optional<TournamentAttributes, 'tournament_id'> {}

export default (sequelize: Sequelize) => {
  class Tournament extends Model<TournamentAttributes, TournamentCreationAttributes> 
    implements TournamentAttributes {
    public tournament_id!: string;
    public location!: string;
    public info?: string;
    public tournament_name!: string;
    public start_date!: Date;
    public end_date!: Date;
    public fk_host_id!: string;
  }

  Tournament.init(
    {
      tournament_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      location: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      info: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      tournament_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fk_host_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Host',
          key: 'host_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Tournament',
      tableName: 'Tournaments',
      timestamps: false,
    }
  );

  return Tournament;
};

