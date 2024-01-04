import { GraphqlClient } from '@shopify/shopify-api/lib/clients/graphql/graphql_client';

import { bulkOperationRunQuery } from '../graphql/queries/locations';
import { TBulkOperationRunResponse } from '../typescript/types';

export async function createBulkOperation(client: GraphqlClient) {
  try {
    const bulkRunResponse = await client.query({
      data: {
        query: bulkOperationRunQuery,
      },
    });

    const bulkOperationRunData =
      (await bulkRunResponse.body) as TBulkOperationRunResponse;

    const bulkOperationId =
      bulkOperationRunData?.data?.bulkOperationRunQuery?.bulkOperation?.id;

    return bulkOperationId;
  } catch (error) {
    console.log(error);
    return null;
  }
}
