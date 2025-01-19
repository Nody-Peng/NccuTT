import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 定義模型屬性型別
interface EventAttributes {
  event_id: string;
  event_name: string;
  event_type: 'team' | 'individual'; // ENUM 類型
  fk_division_id: string;
}

// 定義可選屬性型別，用於創建時
interface EventCreationAttributes extends Optional<EventAttributes, 'event_id'> {}

export default (sequelize: Sequelize) => {
  class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public event_id!: string;
    public event_name!: string;
    public event_type!: 'team' | 'individual';
    public fk_division_id!: string;
  }

  Event.init(
    {
      event_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      event_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      event_type: {
        type: DataTypes.ENUM('team', 'individual'),
        allowNull: false,
      },
      fk_division_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Divisions',
          key: 'division_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'Events',
      timestamps: false, // 不需要 createdAt 和 updatedAt
    }
  );

  return Event;
};

