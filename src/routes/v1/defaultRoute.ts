import { Router, Request, Response } from 'express';

export const defaultRoute = Router();

defaultRoute.get('/', async (req: Request, res: Response) => {
  res.send('Welcome to the SOAP Dish API!');
});
