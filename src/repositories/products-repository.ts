import { productCollection, ProductType } from './db';

export const productsRepository = {
  async getProducts(): Promise<ProductType[]> {
    return productCollection.find({}).toArray()
  }
}
