import e, {Router, Request, Response} from "express";
import {videosRepository} from "../repositories/videos-repository";
import {videosCollection, VideoType} from "../repositories/db";
import { ObjectId } from "mongodb";

export type VideoInput = {
  title: string;
  author: string;
  availableResolutions: string[];
}

type VideoViewModel = {
  _id: number; // = _id.toString()
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  createdAt: Date;
  publicationDate: Date;
  availableResolutions: string[];
};

const AvailableResolutions = [
  'P144',
  'P240',
  'P360',
  'P480',
  'P720',
  'P1080',
  'P1440',
  'P2160'
]

export const videosRouter = Router({})

videosRouter.get('/', async (req: Request, res: Response) => {
  const docs = await videosRepository.getVideos()
  const videos = docs.map((value) => ({
    id: value.id,
    title: value.title,
    author: value.author,
    canBeDownloaded: value.canBeDownloaded,
    minAgeRestriction: value.minAgeRestriction,
    createdAt: value.createdAt,
    publicationDate: value.publicationDate,
    availableResolutions: value.availableResolutions
  }))
  return res.status(200).json(videos);
})

videosRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.sendStatus(400)
    }

    const videos = await videosRepository.getVideos();
    const found = videos.find((value: VideoType) => value.id === id )
    if (!found) {
      return res.sendStatus(404);
    }

    const { _id, ...view} = found as any;

    return res.status(200).json(view);
  }
  catch (err) {
    res.sendStatus(500)
  }
})

videosRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    // 1) нормализация id
    const idNum = Number(req.params.id);
    if (Number.isNaN(idNum)) {
      return res.sendStatus(400);
    }

    // 2) деструктуризация
    const {
      title,
      author,
      availableResolutions,
      canBeDownloaded,
      minAgeRestriction,
      publicationDate,
    } = req.body ?? {};

    const errors: { message: string; field: string }[] = [];

    // 3) валидация
    if (!title || typeof title !== 'string' || title.length > 40) {
      errors.push({ message: 'title is required', field: 'title' });
    }

    if (!author || typeof author !== 'string' || author.length > 20) {
      errors.push({ message: 'author is required', field: 'author' });
    }

    if (availableResolutions !== undefined) {
      if (!Array.isArray(availableResolutions)) {
        errors.push({ message: 'availableResolutions must be an array', field: 'availableResolutions' });
      } else {
        for (const item of availableResolutions) {
          if (!AvailableResolutions.includes(item)) {
            errors.push({ message: 'correct availableResolutions is required', field: 'availableResolutions' });
            break;
          }
        }
      }
    }

    if (canBeDownloaded !== undefined && typeof canBeDownloaded !== 'boolean') {
      errors.push({ message: 'canBeDownloaded must be boolean', field: 'canBeDownloaded' });
    }

    if (minAgeRestriction !== undefined &&
        minAgeRestriction !== null &&
        (!Number.isInteger(minAgeRestriction) || minAgeRestriction < 1 || minAgeRestriction > 18)) {
      errors.push({ message: 'minAgeRestriction must be integer 1..18 or null', field: 'minAgeRestriction' });
    }

    if (publicationDate !== undefined && typeof publicationDate !== 'string') {
      errors.push({ message: 'publicationDate must be ISO string', field: 'publicationDate' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errorsMessages: errors });
    }

    // 4) готовим $set без undefined
    const updatedDoc: any = {
      title,
      author,
      availableResolutions,
      canBeDownloaded,
      minAgeRestriction,
      publicationDate,
    };
    Object.keys(updatedDoc).forEach((k) => updatedDoc[k] === undefined && delete updatedDoc[k]);

    // 5) ищем по ЧИСЛОВОМУ id
    let result = await videosCollection.updateOne({ id: idNum }, { $set: updatedDoc });

    // fallback на случай, если старые записи лежат со строковым id (временно, чтобы пройти тесты)
    if (!result.matchedCount) {
      result = await videosCollection.updateOne({ id: String(idNum) }, { $set: updatedDoc });
    }

    if (!result.matchedCount) return res.sendStatus(404);
    return res.sendStatus(204);
  } catch (err) {
    console.error('PUT /videos/:id error:', err);
    return res.sendStatus(500);
  }
});

videosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {title, author, availableResolutions} = req.body;
    const errors: {message: string, field: string}[] = [];

    if (!title || title.length > 40) {
      errors.push(
          {message: 'title is required', field: 'title'}
      )
    }

    if (!author || author.length > 20) {
      errors.push(
          {message: 'author is required', field: 'author'}
      )
    }

    for (let item of availableResolutions) {
      if (!AvailableResolutions.includes(item)) {
        errors.push(
            {message: 'correct availableResolutions is required', field: 'availableResolutions'}
        )
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({errorsMessages: errors})
    }

    const now = new Date();

    const doc: VideoType = {
      id: +(new Date()),
      title,
      author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: now,
      publicationDate: new Date(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
      availableResolutions
    }

    const result = await videosCollection.insertOne(doc);
    const { _id, ...view } = doc as any;
    return res.status(201).json(view);
  } catch (err) {
    res.sendStatus(500);
  }
})

videosRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.sendStatus(400);
  }

  const result = await videosCollection.deleteOne({id: id})
  if (!result.deletedCount) return res.sendStatus(404);

  return res.sendStatus(204)
})

videosRouter.delete('/all-data', async (req: Request, res: Response) => {
  try {
    await videosCollection.deleteMany({})

    res.sendStatus(204)
  } catch (err) {
    res.sendStatus(500)
  }
})


