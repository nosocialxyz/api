import { NFT_COLL } from "../config";
import { createDbRequestor } from "./db";
import { createLensApiRequestor } from "./lens-api";
import { withDbReady } from "./utils";
import { MongoDB } from "../db";
import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { NFTStatus } from "../types/database.d";

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
      const profileId = String(req.query['id']);
      const profileBase = await dbRequestor.getProfileBaseById(profileId);
      res.json(profileBase);
    },next);
  },
  appBase: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query['id']);
      const profileBase = await dbRequestor.getAppBaseById(profileId);
      res.json(profileBase);
    },next);
  },
  BenefitBase: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query['id']);
      const profileBase = await dbRequestor.getBenefitBaseById(profileId);
      res.json(profileBase);
    },next);
  },
  achievementCollect: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profileId = String(req.query['id']);
      const achvId = String(req.query['achvId']);
      const achvInstId = profileId+'-'+achvId;
      const hasAchievement = await dbRequestor.hasAchievementById(achvInstId);
      if (hasAchievement) {
        const data = await dbRequestor.genNftDataByAchvId(achvId);
        if (JSON.stringify(data) === '{}') {
          res.json({
            statusCode: 404,
            message: `Cannot find achievement:${achvId}`,
          });
        } else {
          Object.assign(data, { profileId: profileId });
          req.body = data;
          nft.pushNft(req, res, next);
          res.json({
            statusCode: 200,
            message: "Minting is in progress, please wait for the confirmation of the block",
          });
        }
      } else {
        res.json({
          statusCode: 404,
          message: `Cannot find achievement:${achvInstId}`,
        });
      }
    },next);
  },
  achieveAchievement: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const achvInstId = String(req.query['id']);
      const dbRequestor = createDbRequestor(db);
      await dbRequestor.achieveAchievement(achvInstId);
      res.json({
        statusCode: 200,
        message: "success",
      });
    },next);
  }
};

export const ai = {
  pushProfile: async (req: Request, res: Response, next: NextFunction) => {
    withDbReady(async (db: MongoDB) => {
      const dbRequestor = createDbRequestor(db);
      const profile = String(req.query["profile"]);
      logger.info(`⛓ [ai]: Push ${profile} into waiting list`);
      await dbRequestor.pushProfileIntoWaiting(profile, "NotStarted");
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
        "NotStarted",
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
      await dbRequestor.updateWaitingProfileStatus(waiting_id, "Finished");
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
      const profile = String(req.query["profile"]);
      logger.info(
        `⛓ [ai]: Push ${profile} into waiting list to generate AI tag`
      );
      await dbRequestor.pushProfileIntoWaiting(profile, "AITagNotStarted");
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
      const data = {
        profileId: String(req.body["profileId"]),
        name: String(req.body["name"]),
        description: String(req.body["description"]),
        category: String(req.body["category"]),
        provider: String(req.body["provider"]),
        type: String(req.body["type"]),
        pic_url: String(req.body["pic_url"]),
        nftId: String(req.body["nftId"]),
        status: "NotMinted",
        txhash: null,
        tokenId: null,
        _id: String(req.body["profileId"]) + "-" + String(req.body["nftId"]),
      };
      logger.info(
        `⛓ [ai]: Update NFT ${data.nftId} for profile ${data.profileId}`
      );
      await dbRequestor.insertOne(NFT_COLL, data);
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
