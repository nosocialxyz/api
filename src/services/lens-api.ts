import Bluebird from "bluebird";
import { logger } from "../utils/logger";
import { apolloClient } from "../apollo-client";
import { LensApiRequestor } from "../types/lens-api.d";
import { LENS_DATA_LIMIT } from "../config";
import { DbRequestor } from "../types/database.d";
import {
  ExploreProfilesDocument,
  ExploreProfilesRequest,
  ProfileSortCriteria,
  PublicationsQueryRequest,
  PublicationsDocument,
  PublicationTypes,
  ProfileQueryRequest,
  ProfilesDocument,
  ProfileDocument,
  SingleProfileQueryRequest,
} from "../graphql/generated";

async function queryPublications(request: PublicationsQueryRequest) {
  const res = await apolloClient.query({
    query: PublicationsDocument,
    variables: {
      request,
    },
  });
  return res.data;
}

async function exploreProfiles(request: ExploreProfilesRequest) {
  const res = await apolloClient.query({
    query: ExploreProfilesDocument,
    variables: {
      request,
    },
  });
  return res.data.exploreProfiles;
}

async function getProfilesShow(request: ProfileQueryRequest) {
  const res = await apolloClient.query({
    query: ProfilesDocument,
    variables: {
      request,
    },
  });
  const data = res.data.profiles;
  if (data === null || data === undefined) throw new Error("Get (show)profiles failed.");

  return data;
}

async function getProfile(request: SingleProfileQueryRequest) {
  const res = await apolloClient.query({
    query: ProfileDocument,
    variables: {
      request,
    },
  });
  const data = res.data.profile;
  if (data === null || data === undefined) throw new Error("Get (NS)profiles failed.");

  return data;
}

export function createLensApiRequestor(): LensApiRequestor {
  const getProfilesByAddress = async (address: string): Promise<any[]> => {
    const res: any[] = [];
    let cursor = "{}";
    while (true) {
      try {
        const profiles = await getProfilesShow({
          ownedBy: [address],
          cursor: cursor,
          limit: LENS_DATA_LIMIT,
        });

        for (const profile of profiles.items) {
          res.push({
            id: profile.id,
            name: profile.name,
            handle: profile.handle,
          });
        }
        cursor = profiles.pageInfo.next;
        if (profiles.items.length < LENS_DATA_LIMIT) break;
      } catch (e: any) {
        logger.error(`Get profiles by address failed, error:${e}`);
        if (e.networkError && e.networkError.statusCode === 429) await Bluebird.delay(60 * 1000);
      }
    }
    return res;
  };

  const getProfileById = async (id: string, dbRequestor: DbRequestor): Promise<any> => {
    try {
      const profile = await getProfile({
        profileId: id,
      });
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
      const createdAt = await dbRequestor.getEaliestCreatedPubDate(id);
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
    } catch (e: any) {
      logger.error(`Get profile:${id} failed, error:${e}`);
      if (e.networkError && e.networkError.statusCode === 429) await Bluebird.delay(60 * 1000);
    }
  };

  return {
    getProfilesByAddress,
    getProfileById,
  };
}
