import { logger } from "../utils/logger";
import { loadDB, MongoDB } from "../db";
import {
  DbRequestor,
  ProfileType,
  PostType,
  AIResultType,
  WaitingProfileType,
  NFTStatus,
} from "../types/database.d";
import {
  PROFILE_COLL,
  PUBLICATION_COLL,
  CURSOR_COLL,
  WHITELIST_COLL,
  AI_COLL,
  WAITING_COLL,
  NFT_COLL,
} from "../config";
import { DefaultDeserializer } from "v8";
var ObjectID = require("mongodb").ObjectID;

export function createDbRequestor(db: MongoDB): DbRequestor {
  const insertOne = async (collName: string, data: any): Promise<void> => {
    try {
      await db.dbHandler.collection(collName).insertOne(data);
    } catch (e: any) {
      if (e.code !== 11000) throw new Error(`Insert data failed, message:${e}`);
    }
  };

  const insertMany = async (collName: string, data: any): Promise<void> => {
    try {
      await db.dbHandler.collection(collName).insertMany(data);
    } catch (e: any) {
      if (e.code !== 11000)
        throw new Error(`Insert many data failed, message:${e}`);
    }
  };

  const deleteOne = async (collName: string, query: any): Promise<void> => {
    await db.dbHandler.collection(collName).deleteOne(collName, query);
  };

  const deleteMany = async (collName: string, query: any): Promise<void> => {
    await db.dbHandler.collection(collName).deleteMany(collName, query);
  };

  const updateOne = async (
    collName: string,
    query: any,
    data: any
  ): Promise<void> => {
    // upsert is true which means create new document where the indicated one doesn't exist.
    const options = { upsert: true };
    await db.dbHandler
      .collection(CURSOR_COLL)
      .updateOne(query, { $set: data }, options);
  };

  const findOne = async (
    collName: string,
    query: any,
    options?: any
  ): Promise<any> => {
    return await db.dbHandler.collection(collName).findOne(query, options);
  };

  const findMany = async (
    collName: string,
    query: any,
    options?: any
  ): Promise<any> => {
    return await db.dbHandler.collection(collName).find(query, options);
  };

  const inWhitelist = async (address: string): Promise<boolean> => {
    const res = await db.dbHandler
      .collection(WHITELIST_COLL)
      .findOne({ _id: address });
    return res !== null;
  };

  const getProfilesByAddress = async (
    address: string
  ): Promise<ProfileType[]> => {
    const res = await db.dbHandler.collection(PROFILE_COLL).aggregate([
      {
        $match: { ownedBy: address },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          handle: 1,
        },
      },
    ]);
    if (res === null) return [];

    return await res.toArray();
  };

  const getPostByProfile = async (profile: string): Promise<PostType[]> => {
    const res = await db.dbHandler.collection(PUBLICATION_COLL).aggregate([
      {
        $match: { "profile.id": profile, __typename: "Post" },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          content: "$metadata.content",
        },
      },
    ]);
    if (res === null) {
      logger.info(`⛓ [db]: No post with profile ${profile}`);
      return [];
    }

    logger.info(`⛓ [db]: sssssss ${JSON.stringify(res)}`);

    return await res.toArray();
  };

  const getAIResultByProfile = async (
    profile: string
  ): Promise<AIResultType[]> => {
    const res = await db.dbHandler.collection(AI_COLL).aggregate([
      {
        $match: { profile: profile },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          refined: 1,
        },
      },
    ]);
    if (res === null) {
      logger.info(`⛓ [db]: No post with profile ${profile}`);
      return [];
    }

    logger.info(`⛓ [db]: sssssss ${JSON.stringify(res)}`);

    return await res.toArray();
  };

  const updateAIResultByPost = async (result: any): Promise<boolean> => {
    try {
      await db.dbHandler.collection(AI_COLL).insertOne(result);
      return true;
    } catch (e: any) {
      logger.warn("⛓ [db]: Something wrong with update ai result");
      if (e.code !== 11000) throw new Error(`Insert data failed, message:${e}`);
    }
    return false;
  };

  const pushProfileIntoWaiting = async (
    profile: any,
    status: string
  ): Promise<boolean> => {
    try {
      const waiting = {
        profile: profile,
        status: status,
      };
      await db.dbHandler.collection(WAITING_COLL).insertOne(waiting);
      return true;
    } catch (e: any) {
      logger.warn("⛓ [db]: Something wrong with insert new waiting profile");
      if (e.code !== 11000) throw new Error(`Insert data failed, message:${e}`);
    }
    return false;
  };

  const fetchNextWaitingProfile = async (
    preStatus: string,
    postStatus: string
  ): Promise<WaitingProfileType> => {
    const res = await db.dbHandler
      .collection(WAITING_COLL)
      .findOne(
        { status: preStatus },
        { projection: { status: 1, profile: 1, _id: 0, id: "$_id" } }
      );
    if (res === null) {
      logger.info(`⛓ [db]: No waiting profile`);
      return res;
    }
    await db.dbHandler
      .collection(WAITING_COLL)
      .updateOne({ _id: res.id }, { $set: { status: postStatus } });
    return res;
  };

  const updateWaitingProfileStatus = async (
    id: string,
    status: string
  ): Promise<boolean> => {
    await db.dbHandler
      .collection(WAITING_COLL)
      .updateOne({ _id: ObjectID(id) }, { $set: { status: status } });
    return true;
  };

  const fetchNextWaitingNFT = async (
    preStatus: string,
    postStatus: string
  ): Promise<any> => {
    const resCursor = await db.dbHandler.collection(NFT_COLL).aggregate([
      {
        $lookup: {
          from: "profile",
          localField: "profile",
          foreignField: "_id",
          as: "profile_info",
        },
      },
      {
        $match: { status: preStatus },
      },
      {
        $limit: 1,
      },
    ]);

    const res = await resCursor.tryNext();
    if (res === null) {
      logger.info(`⛓ [db]: No waiting nft`);
      return res;
    }

    res.id = res._id;
    res.ownedBy = res.profile_info[0].ownedBy;
    delete res._id;
    delete res.profile_info;

    logger.info(`⛓ [db]: query success ${JSON.stringify(res)}`);
    if (postStatus != preStatus) {
      await db.dbHandler
        .collection(NFT_COLL)
        .updateOne({ _id: res.id }, { $set: { status: postStatus } });
    }
    return res;
  };

  const updateWaitingNFTStatus = async (
    id: string,
    nftStatus: NFTStatus
  ): Promise<boolean> => {
    await db.dbHandler
      .collection(NFT_COLL)
      .updateOne({ _id: ObjectID(id) }, { $set: nftStatus });
    return true;
  };

  return {
    insertOne,
    insertMany,
    deleteOne,
    deleteMany,
    updateOne,
    findOne,
    findMany,
    inWhitelist,
    getProfilesByAddress,
    getPostByProfile,
    updateAIResultByPost,
    getAIResultByProfile,
    pushProfileIntoWaiting,
    fetchNextWaitingProfile,
    updateWaitingProfileStatus,
    fetchNextWaitingNFT,
    updateWaitingNFTStatus,
  };
}
