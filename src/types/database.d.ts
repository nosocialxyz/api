export interface DbRequestor {
  insertOne: (collName: string, data: any) => Promise<void>;
  insertMany: (collName: string, data: any) => Promise<void>;
  deleteOne: (collName: string, query: any) => Promise<void>;
  deleteMany: (collName: string, query: any) => Promise<void>;
  updateOne: (collName: string, query: any, data: any) => Promise<void>;
  findOne: (collName: string, query: any) => Promise<any>;
  findMany: (collName: string, query: any) => Promise<any>;
  inWhitelist: (address: string) => Promise<boolean>;
  getProfilesByAddress: (address: string) => Promise<ProfileType[]>;
  getContentByProfile: (profile: string) => Promise<PostType[]>;
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
