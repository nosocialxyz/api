import { logger } from '../utils/logger';
import { loadDB, MongoDB } from '../db';
import { 
  DbRequestor,
  ProfileType,
} from '../types/database.d';
import { 
  PROFILE_COLL,
  PUBLICATION_COLL,
  CURSOR_COLL,
  WHITELIST_COLL,
} from '../config';

export function createDbRequestor(db: MongoDB): DbRequestor {
  const insertOne = async (collName: string, data: any): Promise<void> => {
    try {
      await db.dbHandler.collection(collName).insertOne(data);
    } catch (e: any) {
      if (e.code !== 11000)
        throw new Error(`Insert data failed, message:${e}`);
    }
  }

  const insertMany = async (collName: string, data: any): Promise<void> => {
    try {
      await db.dbHandler.collection(collName).insertMany(data);
    } catch (e: any) {
      if (e.code !== 11000)
        throw new Error(`Insert many data failed, message:${e}`);
    }
  }

  const deleteOne = async (collName: string, query: any): Promise<void> => {
    await db.dbHandler.collection(collName).deleteOne(collName, query);
  }

  const deleteMany = async (collName: string, query: any): Promise<void> => {
    await db.dbHandler.collection(collName).deleteMany(collName, query);
  }

  const updateOne = async (collName: string, query: any, data: any): Promise<void> => {
    // upsert is true which means create new document where the indicated one doesn't exist.
    const options = { upsert: true };
    await db.dbHandler.collection(CURSOR_COLL).updateOne(query, { $set: data }, options);
  }

  const findOne = async (collName: string, query: any, options?: any): Promise<any> => {
    return await db.dbHandler.collection(collName).findOne(query, options);
  }

  const findMany = async (collName: string, query: any, options?: any): Promise<any> => {
    return await db.dbHandler.collection(collName).find(query, options);
  }

  const inWhitelist = async (address: string): Promise<boolean> => {
    const res = await db.dbHandler.collection(WHITELIST_COLL).findOne({_id:address});
    return res !== null;
  }

  const getProfilesByAddress = async (address: string): Promise<ProfileType[]> => {
    const res = await db.dbHandler.collection(PROFILE_COLL).aggregate(
      [
        {
          $match: {ownedBy: address},
        },
        {
          $project:
          {
            _id: 0,
            "id": "$_id",
            name:1,
            handle:1,
          },
        },
      ]
    )
    if (res === null)
      return [];

    return await res.toArray();
  }

  const getEaliestCreatedPubDate = async (id: string): Promise<string> => {
    const res = await db.dbHandler.collection(PUBLICATION_COLL).find(
      {
        "profile.id": id,
      },
      {
        createdAt: 1
      }
    ).sort({createdAt:1}).limit(1).toArray();
    if (res.length > 0) {
      return res[0].createdAt;
    }
    return '';
  }

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
    getEaliestCreatedPubDate,
  }
}
