import { logger } from "../utils/logger";
import { loadDB, MongoDB } from "../db";
import { Dayjs } from "../utils/datetime";
import { DbRequestor, ProfileType, PostType, AIResultType, WaitingProfileType, NFTStatus } from "../types/database.d";
import {
  PROFILE_COLL,
  PUBLICATION_COLL,
  CURSOR_COLL,
  WHITELIST_COLL,
  WAITING_COLL,
  NFT_COLL,
  TASK_COLL,
  BENEFIT_TMPL_COLL,
  ACHV_TMPL_COLL,
  AI_COLL,
  APP_COLL,
  ACHIEVEMENT_COLL,
  TASK_TMPL_COLL,
} from "../config";

export enum AchievementStatus {
  NOTSTART = "notStart",
  READY = "ready",
  //UNCLAIMED = 'unclaimed',
  CLAIMING = "claiming",
  ACHIEVED = "achieved",
}

var ObjectID = require("mongodb").ObjectID;
const nftPrefix = "https://opensea.io/assets/matic/0x9b82daf85e9dcc4409ed13970035a181fb411542/";

function baseToDecimal(input: string, base: number) {
  // works up to 72057594037927928 / FFFFFFFFFFFFF8
  var field = input;
  return {
    $sum: {
      $map: {
        input: { $range: [0, { $strLenBytes: field }] },
        in: {
          $multiply: [
            {
              $pow: [
                base,
                {
                  $subtract: [{ $strLenBytes: field }, { $add: ["$$this", 1] }],
                },
              ],
            },
            {
              $indexOfBytes: ["0123456789ABCDEF", { $toUpper: { $substrBytes: [field, "$$this", 1] } }],
            },
          ],
        },
      },
    },
  };
}

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
      if (e.code !== 11000) throw new Error(`Insert many data failed, message:${e}`);
    }
  };

  const deleteOne = async (collName: string, query: any): Promise<void> => {
    await db.dbHandler.collection(collName).deleteOne(collName, query);
  };

  const deleteMany = async (collName: string, query: any): Promise<void> => {
    await db.dbHandler.collection(collName).deleteMany(collName, query);
  };

  const updateOne = async (collName: string, query: any, data: any): Promise<void> => {
    // upsert is true which means create new document where the indicated one doesn't exist.
    const options = { upsert: true };
    await db.dbHandler.collection(collName).updateOne(query, { $set: data }, options);
  };

  const findOne = async (collName: string, query: any, options?: any): Promise<any> => {
    return await db.dbHandler.collection(collName).findOne(query, options);
  };

  const findMany = async (collName: string, query: any, options?: any): Promise<any> => {
    return await db.dbHandler.collection(collName).find(query, options);
  };

  const inWhitelist = async (address: string): Promise<boolean> => {
    const res = await db.dbHandler.collection(WHITELIST_COLL).findOne({ _id: address });
    return res !== null;
  };

  const getProfilesByAddress = async (address: string): Promise<ProfileType[]> => {
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
    ]).toArray();

    return await res;
  };

  const getProfileById = async (id: string): Promise<any> => {
    const profile = await db.dbHandler.collection(PROFILE_COLL).findOne({_id: id});
    if (!profile) {
      throw new Error(`Cannot find id:${id} in DB.`);
    }
    const attributes = ((profile: any) => {
      interface ProfileAttr {
        location: string;
        website: string;
        twitter: string;
      }
      let res: ProfileAttr = {
        location: "",
        website: "",
        twitter: "",
      };
      const tagSet = new Set(Object.keys(res));
      for (const { key, value } of profile.attributes) {
        if (tagSet.has(key)) {
          res[key as keyof typeof res] = value;
        }
      }
      return res;
    })(profile);
    const getPictureUrl = (pic: any) => {
      if (!(pic.original && pic.original.url)) {
        return null;
      }
      const url = pic.original.url;
      const lensInfraUrl = "https://lens.infura-ipfs.io/ipfs/";
      const ipfsTitle = "ipfs://";
      if (url.startsWith(ipfsTitle)) {
        return lensInfraUrl + url.substring(ipfsTitle.length, url.length);
      }
      return url;
    };
    const createdAt = await getEaliestCreatedPubDate(id);
    return {
      id: profile._id,
      picture: getPictureUrl(profile.picture),
      coverPicture: getPictureUrl(profile.coverPicture),
      ownedBy: profile.ownedBy,
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio,
      followers: profile.stats.totalFollowers,
      following: profile.stats.totalFollowing,
      createdAt: createdAt,
      attributes: attributes,
    };
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
      logger.info(`??? [db]: No post with profile ${profile}`);
      return [];
    }

    logger.info(`??? [db]: sssssss ${JSON.stringify(res)}`);

    return await res.toArray();
  };

  const getAIResultByProfile = async (profile: string): Promise<AIResultType[]> => {
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
      logger.info(`??? [db]: No post with profile ${profile}`);
      return [];
    }

    logger.info(`??? [db]: sssssss ${JSON.stringify(res)}`);

    return await res.toArray();
  };

  const getAITagsByHandle = async (handle: string): Promise<any> => {
    const profile = await db.dbHandler.collection(PROFILE_COLL).findOne({ handle: handle });
    if (profile === null) return null;

    const tags = await db.dbHandler
      .collection(WAITING_COLL)
      .aggregate([
        {
          $match: { _id: profile._id + "-0xffffffff" },
        },
        {
          $lookup: {
            from: NFT_COLL,
            localField: "_id",
            foreignField: "_id",
            as: "nft_info",
          },
        },
        {
          $project: {
            _id: 0,
            unprocessed: 1,
            status: 1,
            tags: { $first: "$nft_info.tags" },
            aiPicture: { $first: "$nft_info.pic_url" },
          },
        },
      ])
      .tryNext();
    if (tags === null) return null;

    const picture = ((pic: any) => {
      if (pic && pic.uri) {
        return pic.uri;
      }
      if (!(pic && pic.original && pic.original.url)) {
        return null;
      }
      const url = pic.original.url;
      const lensInfraUrl = "https://lens.infura-ipfs.io/ipfs/";
      const ipfsTitle = "ipfs://";
      if (url.startsWith(ipfsTitle)) {
        return lensInfraUrl + url.substring(ipfsTitle.length, url.length);
      }
      return url;
    })(profile.picture);
    Object.assign(tags, { handle: profile.handle, picture: picture });
    return tags;
  };

  const updateAIResultByPost = async (result: any): Promise<boolean> => {
    try {
      await db.dbHandler.collection(AI_COLL).insertOne(result);
      return true;
    } catch (e: any) {
      logger.warn("??? [db]: Something wrong with update ai result");
      if (e.code !== 11000) throw new Error(`Insert data failed, message:${e}`);
    }
    return false;
  };

  const pushProfileIntoWaiting = async (
    profileId: string,
    types: string,
    preStatus: string,
    postStatus: string
  ): Promise<boolean> => {
    const id = profileId + "-" + types;
    try {
      const filter = {
        _id: id,
        status: preStatus,
      };
      const waiting = {
        _id: id,
        profileId: profileId,
        unprocessed: 0,
        status: postStatus,
      };
      await db.dbHandler.collection(WAITING_COLL).updateOne(filter, { $set: waiting }, { upsert: true });
      return true;
    } catch (e: any) {
      logger.warn("??? [db]: Something wrong with insert new waiting profile");
      if (e.code !== 11000) throw new Error(`Insert data failed, message:${e}`);
    }
    return false;
  };

  const fetchNextWaitingProfile = async (preStatus: string, postStatus: string): Promise<WaitingProfileType> => {
    const res = await db.dbHandler
      .collection(WAITING_COLL)
      .findOne({ status: preStatus }, { projection: { status: 1, profileId: 1, _id: 0, id: "$_id" } });
    if (res === null) {
      logger.info(`??? [db]: No waiting profile`);
      return res;
    }
    await db.dbHandler.collection(WAITING_COLL).updateOne({ _id: res.id }, { $set: { status: postStatus } });
    return res;
  };

  const updateWaitingProfileStatus = async (id: string, unprocessed: number, status: string): Promise<boolean> => {
    await db.dbHandler.collection(WAITING_COLL).updateOne({ _id: id }, { $set: { status: status, unprocessed: unprocessed } });
    return true;
  };

  const fetchNextWaitingNFT = async (preStatus: string, postStatus: string): Promise<any> => {
    const resCursor = await db.dbHandler.collection(NFT_COLL).aggregate([
      {
        $lookup: {
          from: "profile",
          localField: "profileId",
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
      logger.info(`??? [db]: No waiting nft`);
      return res;
    }

    res.id = res._id;
    res.ownedBy = res.profile_info[0].ownedBy;
    delete res._id;
    delete res.profile_info;

    logger.info(`??? [db]: query success ${JSON.stringify(res)}`);
    if (postStatus != preStatus) {
      await db.dbHandler.collection(NFT_COLL).updateOne({ _id: res.id }, { $set: { status: postStatus } });
    }
    return res;
  };

  const updateWaitingNFTStatus = async (id: string, nftStatus: NFTStatus): Promise<boolean> => {
    await db.dbHandler.collection(NFT_COLL).updateOne({ _id: id }, { $set: nftStatus });
    return true;
  };

  const getEaliestCreatedPubDate = async (id: string): Promise<string> => {
    const res = await db.dbHandler
      .collection(PUBLICATION_COLL)
      .find(
        {
          "profile.id": id,
        },
        {
          createdAt: 1,
        }
      )
      .sort({ createdAt: 1 })
      .limit(1)
      .toArray();
    if (res.length > 0) {
      return res[0].createdAt;
    }
    return "";
  };

  const parseProfileInfo = async (profile: any): Promise<any> => {
    const attributes = ((profile: any) => {
      interface ProfileAttr {
        location: string;
        website: string;
        twitter: string;
      }
      let res: ProfileAttr = {
        location: "",
        website: "",
        twitter: "",
      };
      const tagSet = new Set(Object.keys(res));
      for (const { key, value } of profile.attributes) {
        if (tagSet.has(key)) {
          res[key as keyof typeof res] = value;
        }
      }
      return res;
    })(profile);
    const getPictureUrl = (pic: any) => {
      if (!(pic && pic.original && pic.original.url)) {
        return null;
      }
      const url = pic.original.url;
      const lensInfraUrl = "https://lens.infura-ipfs.io/ipfs/";
      const ipfsTitle = "ipfs://";
      if (url.startsWith(ipfsTitle)) {
        return lensInfraUrl + url.substring(ipfsTitle.length, url.length);
      }
      return url;
    };
    const createdAt = await getEaliestCreatedPubDate(profile._id);
    return {
      id: profile._id,
      picture: getPictureUrl(profile.picture),
      coverPicture: getPictureUrl(profile.coverPicture),
      ownedBy: profile.ownedBy,
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio,
      followers: profile.stats.totalFollowers,
      following: profile.stats.totalFollowing,
      createdAt: createdAt,
      attributes: attributes,
    };
  };

  const getProfileBaseById = async (id: string): Promise<any> => {
    // Get profile information
    const profile = await db.dbHandler.collection(PROFILE_COLL).findOne({ _id: id });
    if (profile === null) {
      return null;
    }
    const info = await parseProfileInfo(profile);

    // Get ready achievements
    const achvs = await db.dbHandler
      .collection(ACHIEVEMENT_COLL)
      .aggregate([
        {
          $match: {
            profileId: id,
          },
        },
        {
          $lookup: {
            from: NFT_COLL,
            localField: "_id",
            foreignField: "_id",
            as: "nft_info",
          },
        },
        {
          $set: {
            tokenIdInt: {
              $replaceOne: {
                input: { $first: "$nft_info.tokenId" },
                find: "x",
                replacement: "0",
              },
            },
          },
        },
        {
          $set: {
            tokenStr: {
              $cond: [{ $ne: ["$tokenIdInt", null] }, { $toString: baseToDecimal("$tokenIdInt", 16) }, null],
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$achvId",
            category: "$category",
            provider: "$provider",
            name: "$name",
            description: "$description",
            picture: "$picture",
            tokenId: { $first: "$nft_info.tokenId" },
            url: {
              $concat: [nftPrefix, "$tokenStr"],
            },
            status: "$status",
          },
        },
      ])
      .toArray();
    //for (let i = 0; i < achvs.length; i++) {
    //  if (achvs[i].tokenId) {
    //    Object.assign(achvs[i], { url: nftPrefixUrl + parseInt(achvs[i].tokenId,16) });
    //  }
    //}

    // Get AI tags
    const queryId = id + "-0xffffffff";
    const aiTags = await db.dbHandler
      .collection(NFT_COLL)
      .aggregate([
        {
          $match: {
            _id: queryId,
          },
        },
        {
          $set: {
            tokenIdInt: {
              $replaceOne: {
                input: "$tokenId",
                find: "x",
                replacement: "0",
              },
            },
          },
        },
        {
          $set: {
            tokenStr: {
              $cond: [{ $ne: ["$tokenIdInt", null] }, { $toString: baseToDecimal("$tokenIdInt", 16) }, null],
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: "$name",
            category: "$category",
            provider: "$provider",
            description: "$description",
            picture: "$pic_url",
            tokenId: "$tokenId",
            url: {
              $concat: [nftPrefix, "$tokenStr"],
            },
          },
        },
      ])
      .toArray();
    //for (let i = 0; i < aiTags.length; i++) {
    //  Object.assign(aiTags[i], { url: nftPrefixUrl + parseInt(aiTags[i].tokenId,16) });
    //}

    // Get activities
    const last7Days = Dayjs()
      .subtract(Dayjs().day() + 7, "day")
      .format("YYYY-MM-DD");
    const activitiesStats = await db.dbHandler
      .collection(PUBLICATION_COLL)
      .aggregate([
        {
          $match: {
            "profile.id": id,
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: "$__typename",
            num: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const {
      Post: pNum,
      Comment: cNum,
      Mirror: mNum,
    } = ((activitiesStats: any) => {
      const res = {
        Post: 0,
        Comment: 0,
        Mirror: 0,
      };
      activitiesStats.map((stats: any) => {
        res[stats._id as keyof typeof res] = stats.num;
      });
      return res;
    })(activitiesStats);
    const activities = {
      posts: {
        total: profile.stats.totalPosts,
        lastWeek: pNum,
      },
      comments: {
        total: profile.stats.totalComments,
        lastWeek: cNum,
      },
      mirrors: {
        total: profile.stats.totalMirrors,
        lastWeek: mNum,
      },
    };

    // Get benefits
    const benefitTmpls = await db.dbHandler.collection(BENEFIT_TMPL_COLL).find().toArray();
    const achvedBenefits: any[] = [];
    for (const b of benefitTmpls) {
      const achvb = await db.dbHandler
        .collection(TASK_COLL)
        .aggregate([
          {
            $match: {
              profileId: id,
              taskId: { $in: b.tasks },
            },
          },
          {
            $group: {
              _id: "$profileId",
              num: { $sum: 1 },
            },
          },
          {
            $match: {
              num: { $gte: b.tasks.length },
            },
          },
        ])
        .toArray();
      if (achvb.length > 0) {
        achvedBenefits.push({
          id: b._id,
          rewardType: b.rewardType,
          category: b.category,
          provider: b.provider,
          name: b.name,
          benefitName: b.benefitName,
          description: b.description,
          picture: b.picture,
          providerPicture: b.providerPicture,
          url: b.url,
        });
      }
    }
    return {
      info: info,
      aiTags: aiTags,
      achievements: achvs,
      activities: activities,
      bennefits: achvedBenefits,
    };
  };

  const getAppBaseById = async (id: string): Promise<any> => {
    const items = await db.dbHandler
      .collection(PUBLICATION_COLL)
      .aggregate([
        {
          $match: {
            "profile.id": id,
            appId: { $ne: null },
          },
        },
        {
          $group: {
            _id: {
              type: "$__typename",
              appId: "$appId",
            },
            num: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.appId",
            terms: {
              $push: {
                type: "$_id.type",
                num: "$num",
              },
            },
          },
        },
      ])
      .toArray();
    interface AppStatsTmp {
      Post: number;
      Comment: number;
      Mirror: number;
      Collect: number;
    }
    const appIds: string[] = [];
    const statsMap = new Map();
    for (const { _id, terms } of items) {
      appIds.push(_id);
      let statsTmp: AppStatsTmp = {
        Post: 0,
        Comment: 0,
        Mirror: 0,
        Collect: 0,
      };
      for (const term of terms) {
        statsTmp[term.type as keyof typeof statsTmp] = term.num;
      }
      statsMap.set(_id, statsTmp);
    }

    // Get Apps
    const apps = await db.dbHandler
      .collection(APP_COLL)
      .aggregate([
        {
          $match: {
            name: { $in: appIds },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: "$name",
            description: "$description",
            picture: "$picture",
            url: "$url",
          },
        },
      ])
      .toArray();
    const appMap = new Map();
    for (const app of apps) {
      appMap.set(app.name, app);
    }

    // Get achievement
    const achvTmpls = await db.dbHandler
      .collection(ACHV_TMPL_COLL)
      .aggregate([
        {
          $project: {
            _id: 0,
            id: "$_id",
            category: "$category",
            provider: "$provider",
            name: "$name",
            description: "$description",
            tokenId: "$tokenId",
            picture: "$picture",
            url: "$url",
          },
        },
        {
          $addFields: {
            status: "inProgress",
          },
        },
      ])
      .toArray();
    const achvTmplMap = new Map();
    for (const achvTmpl of achvTmpls) {
      let arrayTmp: any[] = [];
      if (!achvTmplMap.has(achvTmpl.provider)) {
        achvTmplMap.set(achvTmpl.provider, arrayTmp);
      }
      arrayTmp = achvTmplMap.get(achvTmpl.provider);
      arrayTmp.push(achvTmpl);
    }
    const achvs = await db.dbHandler
      .collection(ACHIEVEMENT_COLL)
      .aggregate([
        {
          $match: {
            profileId: id,
            provider: { $in: appIds },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$achvId",
            category: "$category",
            provider: "$provider",
            name: "$name",
            description: "$description",
            tokenId: "$tokenId",
            picture: "$picture",
            url: "$url",
            status: "$status",
          },
        },
      ])
      .toArray();
    const achvMap = new Map();
    if (achvs.length === 0) {
      achvs.push(...achvTmpls);
    }
    for (const achv of achvs) {
      if (!achvMap.has(achv.provider)) {
        achvMap.set(achv.provider, []);
      }
      const achvArray = achvMap.get(achv.provider);
      achvArray.push(achv);
    }
    for (let [provider, achvArray] of achvMap) {
      if (achvTmplMap.has(provider) && achvTmplMap.get(provider).length > achvArray.length) {
        const achvIdSet = new Set();
        for (const item of achvArray) {
          achvIdSet.add(item.id);
        }
        for (const item of achvTmplMap.get(provider)) {
          if (!achvIdSet.has(item.id)) {
            achvArray.push(item);
          }
        }
      }
    }

    // Generate result
    const res: any[] = [];
    for (const { _id, terms } of items) {
      if (appMap.has(_id) && statsMap.has(_id)) {
        const curApp = appMap.get(_id);
        const curAchv = achvMap.get(_id);
        const curStats = statsMap.get(_id);
        res.push({
          // App info
          id: curApp.id,
          name: curApp.name,
          description: curApp.description,
          picture: curApp.picture,
          url: curApp.url,
          // activities
          activities: {
            posts: curStats.Post,
            comments: curStats.Comment,
            mirrors: curStats.Mirror,
            collects: curStats.Collect,
          },
          // achievements
          achievements: curAchv,
        });
      }
    }
    return {
      actived: res,
      notStart: [],
    };
  };

  const getBenefitBaseById = async (id: string): Promise<any> => {
    // Get all benefits
    const benefitTmpls = await db.dbHandler
      .collection(BENEFIT_TMPL_COLL)
      .aggregate([
        {
          $project: {
            _id: 0,
            id: "$_id",
            rewardType: "$rewardType",
            category: "$category",
            provider: "$provider",
            name: "$name",
            benefitName: "$benefitName",
            description: "$description",
            picture: "$picture",
            providerPicture: "$providerPicture",
            tasks: "$tasks",
            url: "$url",
          },
        },
      ])
      .toArray();

    const achvedBs: any[] = [];
    const inProgressBs: any[] = [];
    const notStartBs: any[] = [];

    // Get benefits
    for (const b of benefitTmpls) {
      const finishedTasks = await db.dbHandler
        .collection(TASK_COLL)
        .aggregate([
          {
            $match: {
              profileId: id,
              taskId: { $in: b.tasks },
            },
          },
          {
            $project: {
              _id: 0,
              id: "$taskId",
              name: "$name",
              bio: "$bio",
              description: "$description",
              url: "$url",
            },
          },
          {
            $addFields: {
              isFinished: true,
            },
          },
        ])
        .toArray();
      console.log(`finished ${JSON.stringify(finishedTasks)}`);
      if (finishedTasks.length === b.tasks.length) {
        // Achieved benefits
        let objTmp: any = {
          tasks: finishedTasks,
        };
        Object.assign(b, objTmp);
        achvedBs.push(b);
      } else if (finishedTasks.length === 0) {
        // No-start benefits
        notStartBs.push(b);
      } else {
        // In-progress benefits
        const taskMap = new Map();
        for (const task of finishedTasks) {
          taskMap.set(task.id, task);
        }
        const undoTaskIds: string[] = [];
        for (const id of b.tasks) {
          if (!taskMap.has(id)) {
            undoTaskIds.push(id);
          }
        }
        const undoTasks = await db.dbHandler
          .collection(TASK_TMPL_COLL)
          .aggregate([
            {
              $match: {
                _id: { $in: undoTaskIds },
              },
            },
            {
              $project: {
                _id: 0,
                id: "$_id",
                name: "$name",
                bio: "$bio",
                description: "$description",
                url: "$url",
              },
            },
            {
              $addFields: {
                isFinished: false,
              },
            },
          ])
          .toArray();
        let objTmp: any = {
          tasks: [...finishedTasks, ...undoTasks],
        };
        Object.assign(b, objTmp);
        inProgressBs.push(b);
      }
    }
    return {
      achieved: achvedBs,
      inProgress: inProgressBs,
      notStart: notStartBs,
    };
  };

  const achieveAchievement = async (id: string): Promise<void> => {
    try {
      const query = { _id: id };
      const updateData = { status: AchievementStatus.ACHIEVED };
      await db.dbHandler.collection(ACHIEVEMENT_COLL).updateOne(query, { $set: updateData });
    } catch (e: any) {
      logger.error(`Update achievement:${id} status to 'ACHIEVED' failed, error:${e}`);
    }
  };

  const genNftDataByAchvId = async (id: string): Promise<any> => {
    const data = await db.dbHandler
      .collection(ACHV_TMPL_COLL)
      .aggregate([
        {
          $match: {
            _id: id,
          },
        },
        {
          $project: {
            name: "$name",
            description: "$description",
            category: "$category",
            provider: "$provider",
            type: "SBT",
            pic_url: "$picture",
            nftId: "$_id",
          },
        },
      ])
      .tryNext();
    if (data) {
      return data;
    }
    return {};
  };

  const hasAchievementById = async (id: string): Promise<boolean> => {
    const res = await db.dbHandler.collection(ACHIEVEMENT_COLL).findOne({ _id: id });
    return res !== null;
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
    getAppBaseById,
    getBenefitBaseById,
    getProfileBaseById,
    getProfilesByAddress,
    getProfileById,
    getPostByProfile,
    getAITagsByHandle,
    genNftDataByAchvId,
    updateAIResultByPost,
    getAIResultByProfile,
    pushProfileIntoWaiting,
    fetchNextWaitingProfile,
    updateWaitingProfileStatus,
    fetchNextWaitingNFT,
    updateWaitingNFTStatus,
    getEaliestCreatedPubDate,
    achieveAchievement,
    hasAchievementById,
  };
}
