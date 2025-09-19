import {Router, Response, Request} from "express";
import {videosCollection} from "../repositories/db";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  try {
    await videosCollection.deleteMany({});

    res.sendStatus(204)
  } catch (err) {
    res.sendStatus(500)
  }
})
