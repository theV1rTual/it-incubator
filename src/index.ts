import express, { Request, Response } from 'express'
import { productsRouter } from './routers/products-router'
import { runDb } from './repositories/db'
import {videosRouter} from "./routers/videos-router";

const app = express()

// Готовим подключение к БД один раз:
const ready = runDb()

app.use(express.json())
// Ждём БД перед любым ручкой:
app.use(async (_req, _res, next) => { await ready; next() })

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello Samurai')
})

app.use('/products', productsRouter)
app.use('/videos', videosRouter)

// ❗ НИКАКОГО app.listen на Vercel
export default app
