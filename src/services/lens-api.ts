import Bluebird from 'bluebird';
import { logger } from '../utils/logger';
import { apolloClient } from '../apollo-client';
import { LensApiRequestor } from '../types/lens-api.d';
import { LENS_DATA_LIMIT } from '../config';
import {
  ExploreProfilesDocument,
  ExploreProfilesRequest,
  ProfileSortCriteria, 
  PublicationsQueryRequest,
  PublicationsDocument,
  PublicationTypes,
  ProfileQueryRequest,
  ProfilesDocument,
} from '../graphql/generated';

async function queryPublications(request: PublicationsQueryRequest) {
  const res = await apolloClient.query({
    query: PublicationsDocument,
    variables: {
      request,
    },
  });
  return res.data;
};

async function exploreProfiles(request: ExploreProfilesRequest) {
  const res = await apolloClient.query({
    query: ExploreProfilesDocument,
    variables: {
      request,
    },
  });
  return res.data.exploreProfiles;
};

async function getProfilesShow(request: ProfileQueryRequest) {
  const res = await apolloClient.query({
    query: ProfilesDocument,
    variables: {
      request,
    },
  });
  const data = res.data.profiles;
  if (data === null || data === undefined)
    throw new Error('Get profiles failed.');

  return data;
}

export function createLensApiRequestor(): LensApiRequestor {
  const getProfilesByAddress = async (address: string): Promise<any[]> => {
    const res: any[] = [];
    let cursor = '{}';
    while (true) {
      try {
        const profiles = await getProfilesShow({
          ownedBy:[address],
          cursor: cursor,
          limit:LENS_DATA_LIMIT,
        });

        for (const profile of profiles.items) {
          res.push({
            id: profile.id,
            name: profile.name,
            handle: profile.handle,
          });
        }
        cursor = profiles.pageInfo.next;
        if (profiles.items.length < LENS_DATA_LIMIT)
          break;
      } catch (e: any) {
        logger.error(`Get profiles by address failed, error:${e}`);
        if (e.networkError.statusCode === 429)
          await Bluebird.delay(60 * 1000);
      }
    }
    return res;
  }

  return {
    getProfilesByAddress,
  };
}
