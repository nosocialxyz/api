export interface LensApiRequestor {
  getProfilesByAddress: (address: string) => Promise<any[]>;
}
