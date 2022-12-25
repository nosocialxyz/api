import { DBNAME } from '../config';
import { createDbRequestor } from './db';
import { withDbReady } from './utils';
import { MongoDB } from '../db';
import { NextFunction, Request, Response} from 'express';
import { 
  WhitelistResponse,
  BaseResponse,
  ProfileType,
} from '../types/database.d';

export const base = {
  ping: (req: Request, res: Response, next: NextFunction) => {
    res.json({
      statusCode: 200,
      message: 'Hello, nosocial api',
    })
    next();
  },
  whitelist: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const address = String(req.query['address']);
      const inWhitelist = await dbRequestor.inWhitelist(address);
      res.json({
        statusCode: 200,
        message: 'success',
        inWhitelist: inWhitelist,
      })
    },next);
  },
  profiles: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const address = String(req.query['address']);
      const profiles = await dbRequestor.getProfilesByAddress(address);
      res.json(profiles);
    }, next);
  },
};
