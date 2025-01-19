import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型屬性型別
interface MatchAttributes {
  match_id: string;
  fk_team1_user_id: string;
  fk_team2_user_id: string;
  team1_score: number;
  team2_score: number;
  round: number;
}

// 定義可選屬性型別，用於創建時
interface MatchCreationAttributes extends Optional<MatchAttributes, 'match_id'> {}

export default (sequelize: Sequelize) => {
  class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
    public match_id!: string;
    public fk_team1_user_id!: string;
    public fk_team2_user_id!: string;
    public team1_score!: number;
    public team2_score!: number;
    public round!: number;
  }

  Match.init(
    {
      match_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      fk_team1_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      fk_team2_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      team1_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      team2_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      round: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Match',
      tableName: 'Matches',
      timestamps: false,
    }
  );

  return Match;
};

