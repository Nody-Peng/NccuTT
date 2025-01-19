import { Sequelize, DataTypes, Model, Optional } from 'sequelize'

// 定義模型屬性型別
interface ScheduleAttributes {
  schedule_id: string
  min_wage: number
  time_slot: string
  start_date: Date
  end_date: Date
  fk_judge_id: string
  fk_tournament_id: string
}

// 定義可選屬性型別，用於創建時
interface ScheduleCreationAttributes
  extends Optional<ScheduleAttributes, 'schedule_id'> {}

export default (sequelize: Sequelize) => {
  class Schedule
    extends Model<ScheduleAttributes, ScheduleCreationAttributes>
    implements ScheduleAttributes
  {
    public schedule_id!: string
    public min_wage!: number
    public time_slot!: string
    public start_date!: Date
    public end_date!: Date
    public fk_judge_id!: string
    public fk_tournament_id!: string
  }

  Schedule.init(
    {
      schedule_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      min_wage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      time_slot: {
        type: DataTypes.STRING(10), // 時段A, B, C... 用end_time - start_time算
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
      modelName: 'Schedule',
      tableName: 'Schedules',
      timestamps: false, // 不需要時間戳
    }
  )

  return Schedule
}
