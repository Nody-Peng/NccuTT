import { Sequelize, Dialect } from 'sequelize'
import dbConfig from '../config/db.config'
import UserModel from './User_model'
import JudgeModel from './Judge_model'
import ScheduleModel from './Schedule_model'
import TeamLeaderModel from './TeamLeader_model'
import HostModel from './Host_model'
import TournamentModel from './Tournament_model'
import Judge_infoModel from './Judge_info_model'
import DivisionModel from './Division_model'
import EventModel from './Event_model'
import MatchModel from './Match_model'
import associations from './associations'

// Define the DB type for better type checking
export interface DB {
  Sequelize: typeof Sequelize
  sequelize: Sequelize
  User: any // You can refine this type to match your model
  Judge: any
  Schedule: any
  TeamLeader: any
  Host: any
  Tournament: any
  Judge_info: any
  Division: any
  Event: any
  Match: any
  users_tournaments: any
  judgeInfos_tournaments: any
  events_matches: any
}

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect as Dialect,
  dialectOptions: {
    charset: 'utf8',
  },
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
})

// Create the DB object and define its properties
const DB: DB = {} as DB

DB.Sequelize = Sequelize
DB.sequelize = sequelize

// Define models
DB.User = UserModel(sequelize)
DB.Judge = JudgeModel(sequelize) // Uncomment when ready
DB.Schedule = ScheduleModel(sequelize) // Uncomment when ready
DB.TeamLeader = TeamLeaderModel(sequelize)
DB.Host = HostModel(sequelize)
DB.Tournament = TournamentModel(sequelize)
DB.Judge_info = Judge_infoModel(sequelize)
DB.Division = DivisionModel(sequelize)
DB.Event = EventModel(sequelize)
DB.Match = MatchModel(sequelize)

// Define associations
const { users_tournaments, judgeInfos_tournaments, events_matches } =
  associations(DB, sequelize)

DB.users_tournaments = users_tournaments
DB.judgeInfos_tournaments = judgeInfos_tournaments
DB.events_matches = events_matches

// Sync the database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('資料庫同步成功')
  })
  .catch((err: Error) => {
    console.log('資料庫同步失敗')
    console.error(err)
  })

// Export DB
export default DB

// Test DB connection
sequelize
  .authenticate()
  .then(() => {
    console.log('DB_final連接成功')
  })
  .catch((error: Error) => {
    console.error('DB_final連接失敗', error)
  })
