import stringify from 'fast-json-stable-stringify'
import WebSocket from 'ws'

import { WormholeRegionIds } from './constants/regionIds'
import { recordKill } from './redis'

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

ws.addEventListener('message', () => {
  console.info('Received kill from zKill')
  recordKill()
})
