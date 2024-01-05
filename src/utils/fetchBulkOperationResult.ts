import { GraphqlClient } from '@shopify/shopify-api/lib/clients/graphql/graphql_client';

import { bulkOperationResultQuery } from '../../src/graphql/queries/locations';
import { TBulkOperationResultResponse } from '../../src/typescript/types';

export async function fetchBulkOperationResult(client: GraphqlClient) {
  try {
    const bulkOperationResultResponse = await client.query({
      data: {
        query: bulkOperationResultQuery,
      },
    });

    const data =
      (await bulkOperationResultResponse.body) as TBulkOperationResultResponse;

    return data?.data?.currentBulkOperation?.url;
  } catch (error) {
    console.log('fetchBulkOperationResult error: ', error);
    return null;
  }
}
