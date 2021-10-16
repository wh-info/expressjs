import http from 'http'
import WebSocket, { WebSocketServer } from 'ws'

import { getKillCount } from './redis'
import WebSocketWithHeartbeat from './types/ws'

import './zKillListener'

const port = process.env.PORT || 3333

const server = http.createServer()
const wss = new WebSocketServer({ server })

function heartbeat(this: WebSocket) {
  const client = this as WebSocketWithHeartbeat
  client.isAlive = true
}

// On connect, immediately send the kill count and establish a heartbeat
wss.on('connection', async (ws) => {
  const killCount = await getKillCount()
  const extWs = ws as WebSocketWithHeartbeat

  extWs.isAlive = true
  extWs.on('pong', heartbeat)
  extWs.send(killCount)
})

// Update all clients with the latest kill count every thirty seconds
setInterval(async () => {
  if (wss.clients.size) {
    const killCount = await getKillCount()
    wss.clients.forEach((client) => {
      const extClient = client as WebSocketWithHeartbeat

      extClient.send(killCount)

      if (!extClient.isAlive) {
        console.warn('Disconnecting client, failed hearbeat check.')
        extClient.terminate()
      }

      extClient.isAlive = false
      extClient.ping()
    })
  }
}, 30000)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
