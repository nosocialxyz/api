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
  // nextProfile: async (req: Request, res: Response, next: NextFunction) => {
  //   withDbReady(async (db: MongoDB) => {
  //     const dbRequestor = createDbRequestor(db);
  //     // const profile = String(req.query["profile"]);
  //     const inWhitelist = await dbRequestor.inWhitelist(address);
  //     res.json({
  //       statusCode: 200,
  //       message: "success",
  //       inWhitelist: inWhitelist,
  //     });
  //   }, next);
  // },
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
          result: req.body[id],
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
