import WebSocket from 'ws'

interface WebSocketWithHeartbeat extends WebSocket {
  isAlive: boolean
}

export default WebSocketWithHeartbeat
