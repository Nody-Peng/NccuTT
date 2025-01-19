import { Sequelize, DataTypes, Model, Optional } from 'sequelize'

// 定義模型屬性型別
interface TeamLeaderAttributes {
  team_leader_id: string
  team_coach?: string
  team_name: string
  members?: string // 假設它是儲存 JSON 字串
  register_status: boolean
  fk_user_id: string
}

// 創建一個可選屬性接口，適用於創建時不需要所有字段的情況
interface TeamLeaderCreationAttributes
  extends Optional<TeamLeaderAttributes, 'team_leader_id'> {}

export default (sequelize: Sequelize) => {
  class TeamLeader
    extends Model<TeamLeaderAttributes, TeamLeaderCreationAttributes>
    implements TeamLeaderAttributes
  {
    public team_leader_id!: string
    public team_coach?: string
    public team_name!: string
    public members?: string
    public register_status!: boolean
    public fk_user_id!: string
    public readonly created_at!: Date
  }

  TeamLeader.init(
    {
      team_leader_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      team_coach: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      team_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      members: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        // 假設前端轉成 JSON 字串存入
      },
      register_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      modelName: 'TeamLeader',
      tableName: 'Team_leader',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  )

  return TeamLeader
}
