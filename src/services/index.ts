import { DBNAME } from "../config";
import { createDbRequestor } from "./db";
import { createLensApiRequestor } from "./lens-api";
import { withDbReady } from "./utils";
import { MongoDB } from "../db";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import {
  WhitelistResponse,
  BaseResponse,
  ProfileType,
} from "../types/database.d";

export const base = {
  ping: (req: Request, res: Response, next: NextFunction) => {
    res.json({
      statusCode: 200,
      message: "Hello, nosocial api",
    });
    next();
  },
  whitelist: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const address = String(req.query["address"]);
      const inWhitelist = await dbRequestor.inWhitelist(address);
      res.json({
        statusCode: 200,
        message: "success",
        inWhitelist: inWhitelist,
      });
    }, next);
  },
  profiles: async (req: Request, res: Response, next: NextFunction) => {
    const lensApi = createLensApiRequestor();
    const address = String(req.query["address"]);
    const profiles = await lensApi.getProfilesByAddress(address);
    res.json(profiles);
    next();
  },
};

export const ai = {
  pushProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profile = String(req.query["profile"]);
      logger.info(`⛓ [ai]: Push ${profile} into waiting list`);
      await dbRequestor.pushProfileIntoWaiting(profile);
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
  fetchProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const next_waiting = await dbRequestor.fetchNextWaitingProfile();
      logger.info(`⛓ [ai]: Next waiting profile is ${next_waiting}`);
      res.json(next_waiting);
    }, next);
  },
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const waiting_id = String(req.query["id"]);
      logger.info(`⛓ [ai]: Update ${waiting_id} as finshed`);
      await dbRequestor.updateWaitingProfileStatus(waiting_id);
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
  fetchAllPosts: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profile = String(req.query["profile"]);
      logger.info(`⛓ [ai]: Query all post with profile ${profile}`);
      const contents = await dbRequestor.getPostByProfile(profile);
      logger.info(`⛓ [ai]: All posts are ${contents}`);
      res.json(contents);
    }, next);
  },
  fetchAIResults: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profile = String(req.query["profile"]);
      logger.info(`⛓ [ai]: Query all ai result with profile ${profile}`);
      const contents = await dbRequestor.getAIResultByProfile(profile);
      res.json(contents);
    }, next);
  },
  updateAIResults: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const postIDs = req.body["post_ids"];
      const profileID = req.body["profile"];
      for (const id of postIDs) {
        logger.info(`⛓ [ai]: update ai result for post id ${id}`);
        const result = {
          _id: id,
          profile: profileID,
          raw: req.body["raw"][id],
          refined: req.body["refined"][id],
        };
        await dbRequestor.updateAIResultByPost(result);
      }
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
};
