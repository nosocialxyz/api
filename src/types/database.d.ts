export interface DbRequestor {
  insertOne: (collName: string, data: any) => Promise<void>;
  insertMany: (collName: string, data: any) => Promise<void>;
  deleteOne: (collName: string, query: any) => Promise<void>;
  deleteMany: (collName: string, query: any) => Promise<void>;
  updateOne: (collName: string, query: any, data: any) => Promise<void>;
  findOne: (collName: string, query: any) => Promise<any>;
  findMany: (collName: string, query: any) => Promise<any>;
  inWhitelist: (address: string) => Promise<boolean>;
  getAppBaseById: (id: string) => Promise<any>;
  getBenefitBaseById: (id: string) => Promise<any>;
  getProfileBaseById: (id: string) => Promise<any>;
  getProfilesByAddress: (address: string) => Promise<ProfileType[]>;
  getPostByProfile: (profile: string) => Promise<PostType[]>;
  getAITagsByHandle: (handle: string) => Promise<any>;
  genNftDataByAchvId: (id: string) => Promise<any>;
  updateAIResultByPost: (result: any) => Promise<boolean>;
  getAIResultByProfile: (profile: string) => Promise<AIResultType[]>;
  pushProfileIntoWaiting: (profile: string, types: string, preStatus: string, status: string) => Promise<boolean>;
  fetchNextWaitingProfile: (preStatus: string, postStatus: string) => Promise<WaitingProfileType>;
  updateWaitingProfileStatus: (id: string, unprocessed: number, status: string) => Promise<boolean>;
  fetchNextWaitingNFT: (preStatus: string, postStatus: string) => Promise<any>;
  updateWaitingNFTStatus: (id: string, nftStatus: NFTStatus) => Promise<boolean>;
  getEaliestCreatedPubDate: (id: string) => Promise<string>;
  achieveAchievement: (id: string) => Promise<void>;
  hasAchievementById: (id: string) => Promise<boolean>;
}

export interface BaseResponse {
  statusCode: number;
  message: string;
}

export interface WhitelistResponse extends BaseResponse {
  inWhitelist: boolean;
}

export interface ProfileType {
  id: string;
  name: string;
  handle: string;
}

export interface PostType {
  id: string;
  content: string;
}

export interface AIResultType {
  id: string;
  result: string[];
}

export interface WaitingProfileType {
  id: string;
  profile: string;
  status: string;
}

export interface NFTStatus {
  status: string;
  txhash?: string;
  tokenId?: string;
}
