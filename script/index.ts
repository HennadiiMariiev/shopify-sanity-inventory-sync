import path from 'path';
import { Session } from '@shopify/shopify-api';

import shopify, { session } from '../src/config/shopify';
import sanityService from '../src/services/sanity.service';
import {
  createBulkOperation,
  fetchBulkOperationResult,
  sleep,
  downloadFile,
  isFileClosed,
  isFileExist,
  getDataFromFile,
  deleteFileIfExist,
  mapSanityVariants,
} from '../src/utils';
import {
  DEFAULT_FETCH_DELAY,
  MAX_RETRY_AMOUNT,
} from '../src/config/vars/constants';
import {
  TSanityLocation,
  TSanityPatchLocationObj,
  TVariantWithLocations,
} from '../src/typescript/types';

const client = new shopify.api.clients.Graphql({
  session: session as unknown as Session,
});

const filePath = path.resolve(__dirname, 'data', 'data.jsonl');

async function main() {
  let fileUrl: string | null = null,
    isClosed = false,
    isExist = false,
    retryOpenFileAmount = 0,
    retryFetchAmount = 0;

  await deleteFileIfExist(filePath);

  const createdBulkOperationId = await createBulkOperation(client);

  if (createdBulkOperationId) {
    while (fileUrl === null) {
      fileUrl = await fetchBulkOperationResult(client, createdBulkOperationId);

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

  fileUrl && downloadFile(fileUrl, filePath);

  while (!isExist && !isClosed) {
    isExist = await isFileExist(filePath);

    if (isExist) {
      isClosed = isFileClosed(filePath);
    }

    await sleep(DEFAULT_FETCH_DELAY);

    retryOpenFileAmount += 1;

    if (retryOpenFileAmount === MAX_RETRY_AMOUNT) {
      console.warn(`Can't open file with max retries ${MAX_RETRY_AMOUNT}`);
      break;
    }
  }

  const data = isClosed ? await getDataFromFile(filePath) : null;

  if (data) {
    const locationsResult =
      data?.locationsArr?.length > 0
        ? await sanityService.init_createLocations(data?.locationsArr)
        : null;

    if (!locationsResult) {
      console.warn('Locations not created');
      return;
    }

    const sanityLocationsData: TSanityLocation[] =
      await sanityService.getLocations();

    const preparedSanityVariantsArr = mapSanityVariants(
      data?.variantsWithLocations as TVariantWithLocations[],
      sanityLocationsData
    );

    for (const item of preparedSanityVariantsArr) {
      const res = await sanityService.init_updateSingleVariantWithLocations(
        item.variantId,
        item.locations as TSanityPatchLocationObj[]
      );

      console.log('\n updatedVariant: ', res);
    }
  }

  console.log(
    'locationsWithVariants',
    JSON.stringify(data?.variantsWithLocations?.[0], null, 2)
  );

  console.log('\n=========================================================\n');

  console.log('locations', JSON.stringify(data?.locationsArr, null, 2));
}

main();
