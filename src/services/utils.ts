import {NextFunction, Request, Response} from 'express';
import { DBNAME } from '../config';
import { loadDB } from '../db';

export async function withDbReady(fn: Function, next: NextFunction) {
  const db = await loadDB(DBNAME);
  if (db === null) {
    next(new Error(`{
      statusCode: 500,
      message: 'Load database failed.',
    }`));
    return;
  }
  try {
    await fn(db);
    next();
  } catch (e: any) {
    next(e);
  }
}
