import stringify from 'fast-json-stable-stringify'
import WebSocket from 'ws'

import { WormholeRegionIds } from './constants/regionIds'
import { recordKill } from './redis'

const listen = () => {
  const ws = new WebSocket('wss://zkillboard.com/websocket/')

  ws.addEventListener('open', () => {
    WormholeRegionIds.forEach((regionId, idx) => {
      const payload = stringify({
        action: 'sub',
        channel: `region:${regionId}`,
      })

      // So we don't overwhelm the server immediately after connect
      setTimeout(() => {
        ws.send(payload)
      }, 500 * idx)
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
