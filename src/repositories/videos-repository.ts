import {videosCollection, VideoType} from "./db";

export const videosRepository = {
  async getVideos(): Promise<VideoType[]> {
    return videosCollection.find({}).toArray();
  }
}
