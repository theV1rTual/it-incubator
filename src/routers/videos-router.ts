import {Router, Request, Response} from "express";
import {videosRepository} from "../repositories/videos-repository";
import {videosCollection, VideoType} from "../repositories/db";

export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response) => {
  const videos = await videosRepository.getVideos()
  res.status(200).send(videos)
})

videosRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!Number(req.params.id)) {
      res.sendStatus(400)
    }
    const videos = await videosRepository.getVideos();
    const selectedVideo = videos.filter((value: VideoType) => value.id.toString() == req.params.id )
    if (selectedVideo) {
      res.send(200).json(selectedVideo)
    }
  }
  catch (err) {
    res.sendStatus(500)
  }
})

videosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {title, author} = req.body;
    const errors: {message: string, field: string}[] = [];

    if (!title || title.trim() === '') {
      errors.push(
          {message: 'title is required', field: 'title'}
      )
    }

    if (!author) {
      errors.push(
          {message: 'author is required', field: 'author'}
      )
    }

    if (errors.length > 0) {
      return res.status(400).json({errorsMessages: errors})
    }

  } catch (err) {
    res.sendStatus(500);
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

videosRouter.delete('/all-data', async (req: Request, res: Response) => {
  try {
    await videosCollection.deleteMany({})

    res.sendStatus(204)
  } catch (err) {
    res.sendStatus(500)
  }
})


