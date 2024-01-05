import path from 'path';
import { Session } from '@shopify/shopify-api';

import shopify, { session } from '../config/shopify';
import sanityService from '../services/sanity.service';
import {
  createBulkOperation,
  fetchBulkOperationResult,
  sleep,
  downloadFile,
  getDataFromFile,
  deleteFileIfExist,
  mapSanityVariants,
} from '../utils';
import {
  DEFAULT_FETCH_DELAY,
  MAX_RETRY_AMOUNT,
} from '../config/vars/constants';
import {
  TSanityLocation,
  TSanityPatchLocationObj,
  TVariantWithLocations,
} from '../typescript/types';

const client = new shopify.api.clients.Graphql({
  session: session as unknown as Session,
});

const filePath = path.resolve(__dirname, 'data', 'data.jsonl');

async function main() {
  try {
    let fileUrl: string | null = null,
      retryFetchAmount = 0;

    await deleteFileIfExist(filePath);
    await sanityService.init_deleteLocations();

    const createdBulkOperationId = await createBulkOperation(client);

    if (createdBulkOperationId) {
      while (fileUrl === null) {
        fileUrl = await fetchBulkOperationResult(client);

        await sleep(DEFAULT_FETCH_DELAY);

        retryFetchAmount += 1;

        if (retryFetchAmount === MAX_RETRY_AMOUNT) {
          break;
        }
      }
    }

    if (!fileUrl && retryFetchAmount === MAX_RETRY_AMOUNT) {
      console.warn(
        `Can't get fileUrl from bulkOperation result with max retries ${MAX_RETRY_AMOUNT}`
      );
      return;
    }

    let loadingResult: boolean = false;

    if (fileUrl) {
      loadingResult = (await downloadFile(fileUrl, filePath)) as boolean;
    }

    const data = loadingResult ? await getDataFromFile(filePath) : null;

    if (data) {
      const locationsResult =
        data?.locationsArr?.length > 0
          ? await sanityService.init_createLocations(data?.locationsArr)
          : null;

      if (!locationsResult) {
        console.warn('Locations not created');
        return;
      }

      console.log('locationsResult', locationsResult);

      const sanityLocationsData: TSanityLocation[] =
        await sanityService.getLocations();

      const preparedSanityVariantsArr = mapSanityVariants(
        data?.variantsWithLocations as TVariantWithLocations[],
        sanityLocationsData
      );

      for (const item of preparedSanityVariantsArr) {
        await sanityService.init_updateSingleVariantWithLocations(
          item.variantId,
          item.locations as TSanityPatchLocationObj[]
        );
      }
    }

    console.log(
      'locationsWithVariants',
      JSON.stringify(data?.variantsWithLocations?.[0], null, 2)
    );

    console.log(
      '\n=========================================================\n'
    );

    console.log('locations', JSON.stringify(data?.locationsArr, null, 2));
  } catch (error) {
    console.log('main error: ', error);
  }
}

main();
