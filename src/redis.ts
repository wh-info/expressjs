import Redis from 'ioredis'
import { v4 as uuid } from 'uuid'

const redisUrl = process.env.REDIS_URL as string
const redis = new Redis(redisUrl, {
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDISUSER,
  port: parseInt(process.env.REDISPORT as string),
  host: process.env.REDISHOST,
})

export const getKillCount = () => redis.keys('*').then((keys) => keys.length)

export const recordKill = () => {
  redis.set(uuid(), 1, 'EX', 60 * 60 * 24)
}
export default redis
