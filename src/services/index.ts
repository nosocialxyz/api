import { NFT_COLL } from "../config";
import { createDbRequestor } from "./db";
import { createLensApiRequestor } from "./lens-api";
import { withDbReady, withDbReadyOnly } from "./utils";
import { MongoDB } from "../db";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { NFTStatus } from "../types/database.d";
import { PROFILE_COLL } from "../config";

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
  profileBase: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query["id"]);
      const profileBase = await dbRequestor.getProfileBaseById(profileId);
      res.json(profileBase);
    }, next);
  },
  appBase: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query["id"]);
      const profileBase = await dbRequestor.getAppBaseById(profileId);
      res.json(profileBase);
    }, next);
  },
  BenefitBase: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query["id"]);
      const profileBase = await dbRequestor.getBenefitBaseById(profileId);
      res.json(profileBase);
    }, next);
  },
  achievementCollect: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    withDbReadyOnly(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query["id"]);
      const achvId = String(req.query["achvId"]);
      const achvInstId = profileId + "-" + achvId;
      const hasAchievement = await dbRequestor.hasAchievementById(achvInstId);
      let hasNext = true;
      if (hasAchievement) {
        const data = await dbRequestor.genNftDataByAchvId(achvId);
        if (JSON.stringify(data) === "{}") {
          res.json({
            statusCode: 404,
            message: `Cannot find achievement:${achvId}`,
          });
        } else {
          Object.assign(data, { profileId: profileId });
          req.body = data;
          hasNext = false;
          nft.pushNft(req, res, next);
        }
      } else {
        res.json({
          statusCode: 404,
          message: `Cannot find achievement:${achvInstId}`,
        });
      }
      if (hasNext) next();
    });
  },
  achieveAchievement: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    withDbReady(async (db: MongoDB) => {
      const achvInstId = String(req.query["id"]);
      const dbRequestor = createDbRequestor(db);
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
};

export const lenstag = {
  trigger: async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    withDbReadyOnly(async (db: MongoDB) => {
      let hasNext = true;
      const dbRequestor = createDbRequestor(db);
      const handle = String(req.query["handle"]);
      const resQ = await dbRequestor.findOne(
        PROFILE_COLL,
        { handle: handle+'.lens' },
      );
      if (resQ === null) {
        res.json({
          statusCode: 405,
          message: `handle:${handle} not found.`,
        });
      } else {
        req.query.profile = resQ._id;
        req.query.handle = handle;
        hasNext = false;
        ai.pushProfile(req, res, next);
      }
      if (hasNext) next();
    });
  },
  tags: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const handle = String(req.query["handle"]);
      const resT = await dbRequestor.getAITagsByHandle(handle+".lens")
      res.json(resT);
    }, next);
  }
}

export const ai = {
  pushProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query["profile"]);
      logger.info(`⛓ [ai]: Push ${profileId} into waiting list`);
      // Waiting, Processing, Finished
      // ProfileId types: 0xeeeeeeee
      await dbRequestor.pushProfileIntoWaiting(
        profileId,
        "0xffffffff",
        "Finished",
        "Waiting"
      );
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
  fetchProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const next_waiting = await dbRequestor.fetchNextWaitingProfile(
        "Waiting",
        "Processing"
      );
      logger.info(`⛓ [ai]: Next waiting profile is ${next_waiting}`);
      res.json(next_waiting);
    }, next);
  },
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const waiting_id = String(req.query["id"]);
      logger.info(`⛓ [ai]: Update ${waiting_id} as finshed`);
      const unprocessed = Number(req.body["unprocessed"]);
      const status = unprocessed == 0 ? "Finished" : "Processing";
      await dbRequestor.updateWaitingProfileStatus(
        waiting_id,
        unprocessed,
        status
      );
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
  pushAITag: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query["profile"]);
      logger.info(
        `⛓ [ai]: Push ${profileId} into waiting list to generate AI tag`
      );
      await dbRequestor.pushProfileIntoWaiting(
        profileId,
        "0xdddddddd",
        "AITagGenerated",
        "AITagNotStarted"
      );
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
  fetchNextAITag: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const next_waiting = await dbRequestor.fetchNextWaitingProfile(
        "AITagNotStarted",
        "AITagGenerated"
      );
      logger.info(`⛓ [ai]: Next waiting profile is ${next_waiting}`);
      res.json(next_waiting);
    }, next);
  },
};

export const nft = {
  pushNft: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const id =
        String(req.body["profileId"]) + "-" + String(req.body["nftId"]);
      const query = {
        _id: id,
      };
      const data = {
        profileId: String(req.body["profileId"]),
        name: String(req.body["name"]),
        description: String(req.body["description"]),
        category: String(req.body["category"]),
        provider: String(req.body["provider"]),
        type: String(req.body["type"]),
        pic_url: String(req.body["pic_url"]),
        nftId: String(req.body["nftId"]),
        tags: req.body["tags"],
        status: "NotMinted",
        txhash: null,
        tokenId: null,
        _id: id,
      };
      logger.info(
        `⛓ [ai]: Update NFT ${data.nftId} for profile ${data.profileId}`
      );
      await dbRequestor.updateOne(NFT_COLL, query, data);
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
  fetchNft2Mint: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const next_waiting = await dbRequestor.fetchNextWaitingNFT(
        "NotMinted",
        "Minting"
      );
      logger.info(`⛓ [ai]: Next waiting nft is ${next_waiting}`);
      res.json(next_waiting);
    }, next);
  },
  fetchNft2Update: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const next_waiting = await dbRequestor.fetchNextWaitingNFT(
        "Minting",
        "Minting"
      );
      logger.info(
        `⛓ [ai]: Next waiting nft to update token id is ${next_waiting}`
      );
      res.json(next_waiting);
    }, next);
  },
  updateNft: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const waiting_id = String(req.body["id"]);
      const status = req.body["tokenId"] ? "Minted" : "Minting";
      var nftStatus: NFTStatus = {
        status: status,
      };
      if (req.body["txhash"]) {
        nftStatus.txhash = String(req.body["txhash"]);
      }
      if (req.body["tokenId"]) {
        nftStatus.tokenId = String(req.body["tokenId"]);
      }
      logger.info(`⛓ [ai]: Update ${waiting_id} as finshed`);
      await dbRequestor.updateWaitingNFTStatus(waiting_id, nftStatus);
      res.json({
        statusCode: 200,
        message: "success",
      });
    }, next);
  },
};
