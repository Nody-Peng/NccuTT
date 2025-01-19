import { Sequelize, Model, DataTypes } from 'sequelize'
import type { DB } from './' // Import the DB type (which will be defined in index.ts)

// Define the associations function that sets up many-to-many relationships
const defineAssociations = (DB: DB, sequelize: Sequelize) => {
  // ======================================
  // 1.) Many-to-Many Relationships

  // M:N user as participants/tournament
  const users_tournaments = sequelize.define(
    'users_tournaments',
    {
      user_id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
      },
      tournament_id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
      },
      event_type: {
        type: DataTypes.ENUM('team', 'individual'),
        allowNull: false,
        defaultValue: 'individual',
      },
    },
    {
      timestamps: false,
    }
  )

  DB.User.belongsToMany(DB.Tournament, {
    through: users_tournaments,
    foreignKey: 'user_id',
    otherKey: 'tournament_id',
    as: 'tours',
  })

  DB.Tournament.belongsToMany(DB.User, {
    through: users_tournaments,
    foreignKey: 'tournament_id',
    otherKey: 'user_id',
    as: 'participants',
  })

  // ------------------------------------
  // M:N judge_info/tournament
  const judgeInfos_tournaments = sequelize.define(
    'judgeInfos_tournaments',
    {
      judge_info_id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
      },
      tournament_id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  )

  DB.Judge_info.belongsToMany(DB.Tournament, {
    through: judgeInfos_tournaments,
    foreignKey: 'judge_info_id',
    otherKey: 'tournament_id',
    as: 'judged_tournament',
  })

  DB.Tournament.belongsToMany(DB.Judge_info, {
    through: judgeInfos_tournaments,
    foreignKey: 'tournament_id',
    otherKey: 'judge_info_id',
    as: 'judges_of_tour',
  })

  // ------------------------------------
  // M:N events/matches
  const events_matches = sequelize.define(
    'events_matches',
    {
      event_id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
      },
      match_id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  )

  DB.Event.belongsToMany(DB.Match, {
    through: events_matches,
    foreignKey: 'event_id',
    otherKey: 'match_id',
    as: 'matches',
  })

  DB.Match.belongsToMany(DB.Event, {
    through: events_matches,
    foreignKey: 'match_id',
    otherKey: 'event_id',
    as: 'events',
  })

  // ======================================
  // 2.) One-to-Many Relationships

  // 1:N judge/schedule
  DB.Judge.hasMany(DB.Schedule, {
    foreignKey: 'fk_judge_id',
    as: 'schedules',
  })
  DB.Schedule.belongsTo(DB.Judge, {
    foreignKey: 'fk_judge_id',
    as: 'judge',
  })

  // 1:N host/tournament
  DB.Host.hasMany(DB.Tournament, {
    foreignKey: 'fk_host_id',
    as: 'hosted_tournaments',
  })
  DB.Tournament.belongsTo(DB.Host, {
    foreignKey: 'fk_host_id',
    as: 'host',
  })

  // 1:N tournament/division
  DB.Tournament.hasMany(DB.Division, {
    foreignKey: 'fk_tournament_id',
    as: 'divisions',
  })
  DB.Division.belongsTo(DB.Tournament, {
    foreignKey: 'fk_tournament_id',
    as: 'tour',
  })

  // 1:N division/events
  DB.Division.hasMany(DB.Event, {
    foreignKey: 'fk_division_id',
    as: 'events',
  })
  DB.Event.belongsTo(DB.Division, {
    foreignKey: 'fk_division_id',
    as: 'division',
  })

  return {
    users_tournaments,
    judgeInfos_tournaments,
    events_matches,
  }
}
export default defineAssociations
