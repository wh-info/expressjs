import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import http from 'http'
import morgan from 'morgan'
import cron from 'node-cron'
import WebSocket, { WebSocketServer } from 'ws'

import { getKillCount } from './redis'
import WebSocketWithHeartbeat from './types/ws'

import './zKillListener'

const app = express()
const port = process.env.PORT || 3333

app.use(helmet())
app.use(morgan('dev'))
app.use(cors())

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

function heartbeat(this: WebSocket) {
  const client = this as WebSocketWithHeartbeat
  client.isAlive = true
}

// On connect, immediately send the kill count and establish a heartbeat
wss.on('connection', async (ws) => {
  const killCount = await getKillCount()
  ws.on('pong', heartbeat)
  ws.send(killCount)
})

// Update all clients with the latest kill count every five minutes
cron.schedule('*/5 * * * *', async () => {
  const killCount = await getKillCount()

  wss.clients.forEach((client) => {
    client.send(killCount, () => {
      client.terminate()
    })
  })
})

// Check for unhealthy clients every 10 minutes
cron.schedule('*/10 * * * *', () => {
  wss.clients.forEach((client) => {
    const extClient = client as WebSocketWithHeartbeat
    if (extClient.isAlive) {
      extClient.ping()
    } else {
      console.warn('Disconnecting client, failed hearbeat check.')
      extClient.terminate()
    }
  })
})

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
