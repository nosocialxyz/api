import { DbRequestor } from '../types/database.d';

export interface LensApiRequestor {
  getProfilesByAddress: (address: string) => Promise<any[]>;
  getProfileById: (id: string, dbRequestor: DbRequestor) => Promise<any>;
}
