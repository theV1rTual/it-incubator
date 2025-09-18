import {Router, Request, Response} from "express";
import {videosRepository} from "../repositories/videos-repository";
import {VideoType} from "../repositories/db";

export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response) => {
  const videos = await videosRepository.getVideos()
  res.send(videos)
})

videosRouter.get('/:id', async (req: Request, res: Response) => {
  const videos = await videosRepository.getVideos();
  videos.filter((value: VideoType) => value.id.toString() == req.params.id )
})
