import express from 'express'
import db from '../../models'

const router = express.Router()
const { Tournament: Tour } = db

// 獲取所有 users_tournaments
router.get('/', async (req, res) => {
  try {
    const tour = await Tour.findAll()
    return res.status(200).json(tour)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// 建立新的 tournament
router.post('/', async (req, res) => {
  try {
    const {
      tournament_id,
      location,
      info,
      tournament_name,
      start_date,
      end_date,
      host_id,
    } = req.body

    const new_tour = await Tour.create({
      tournament_id,
      location,
      info,
      tournament_name,
      start_date,
      end_date,
      host_id,
    })
    return res.status(201).json(new_tour)
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    })
  }
})

export default router
