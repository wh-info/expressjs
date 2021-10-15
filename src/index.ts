import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import './ws'

const app = express()
const port = process.env.PORT || 3333

app.use(morgan('dev'))

app.use(helmet())
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? 'wh-info.github.io' : '*',
    optionsSuccessStatus: 200,
  })
)

app.get('/', async (req, res) => {
  res.json({ Hello: 'World' })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
