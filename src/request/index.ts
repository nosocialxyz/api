import { DBNAME } from '../config';
import { loadDB } from '../db';
import { createDbRequestor } from './db';
import { 
  WhitelistResponse,
  BaseResponse,
  ProfileType,
} from '../types/database.d';

export async function inWhitelist(address: string): Promise<WhitelistResponse|BaseResponse> {
  try {
    if (address === '') {
      return {
        statusCode: 400,
        message: 'Address cannot be empty!',
      };
    }

    const db = await loadDB(DBNAME);
    if (db === null) {
      return {
        statusCode: 500,
        message: 'Server internal error: load db failed.',
      };
    }
    const dbRequestor = createDbRequestor(db);
    const res = await dbRequestor.inWhitelist(address);
    const response: WhitelistResponse = {
      statusCode: 200,
      message: 'success',
      inWhitelist: res,
    }
    return response;
  } catch (e: any) {
    const response: BaseResponse = {
      statusCode: 500,
      message: `Server Internal error:${e}`,
    }
    return response;
  }
}

export async function getProfileList(address: string): Promise<ProfileType[]|BaseResponse> {
  try {
    if (address === '') {
      return {
        statusCode: 400,
        message: 'Address cannot be empty!',
      };
    }

    const db = await loadDB(DBNAME);
    if (db === null) {
      return {
        statusCode: 500,
        message: 'Server internal error: load db failed.',
      };
    }
    const dbRequestor = createDbRequestor(db);
    const res = await dbRequestor.getProfilesByAddress(address);
    return res;
  } catch (e: any) {
    const response: BaseResponse = {
      statusCode: 500,
      message: `Server Internal error:${e}`,
    }
    return response;
  }
}
