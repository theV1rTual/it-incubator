import {Router, Request, Response} from "express";
import {videosRepository} from "../repositories/videos-repository";
import {videosCollection, VideoType} from "../repositories/db";

export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response) => {
  const videos = await videosRepository.getVideos()
  res.status(200).send(videos)
})

videosRouter.get('/:id', async (req: Request, res: Response) => {
  const videos = await videosRepository.getVideos();
  videos.filter((value: VideoType) => value.id.toString() == req.params.id )
})

videosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const user = req.body;

    const result = await videosCollection.insertOne(user);

    res.status(201).send(user);

  }
  catch (err) {
    res.status(400);
  }
})

videosRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const videos = await videosRepository.getVideos();
  if (videos.find((value: VideoType) => value.id.toString() === id)) {
    const result = await videosCollection.deleteOne({id: new Object(req.params.id)})
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }



})


