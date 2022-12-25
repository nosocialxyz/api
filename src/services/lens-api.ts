import Bluebird from 'bluebird';
import { apolloClient } from '../apollo-client';
import { LensApiRequestor } from '../types/lens-api.d';
import {
  ExploreProfilesDocument,
  ExploreProfilesRequest,
  ProfileSortCriteria, 
  PublicationsQueryRequest,
  PublicationsDocument,
  PublicationTypes 
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

export function createLensApiRequestor(): LensApiRequestor {
  return {};
}
