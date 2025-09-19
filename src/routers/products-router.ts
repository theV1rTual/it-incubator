import { Request, Response, Router } from 'express';
import { productsRepository } from '../repositories/products-repository';

export const productsRouter = Router({})

productsRouter.get('/', async ( req: Request, res: Response) => {
  const products = await productsRepository.getProducts()
  res.send(products)
})


