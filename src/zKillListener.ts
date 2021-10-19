import stringify from 'fast-json-stable-stringify'
import WebSocket from 'ws'

import { WormholeRegionIds } from './constants/regionIds'
import { recordKill } from './redis'

const listen = () => {
  const ws = new WebSocket('wss://zkillboard.com/websocket/')

  ws.addEventListener('open', () => {
    WormholeRegionIds.forEach((regionId) => {
      const payload = stringify({
        action: 'sub',
        channel: `region:${regionId}`,
      })

      ws.send(payload)
    })
    console.info('Connected to Zkill')
  })

  ws.addEventListener('close', () => {
    setTimeout(() => {
      console.info('Disconnected from Zkill, reconnecting...')
      listen()
    }, 10000)
  })

  ws.addEventListener('error', () => ws.close())

  ws.addEventListener('message', recordKill)
}

listen()
