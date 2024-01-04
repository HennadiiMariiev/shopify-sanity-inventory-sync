import path from 'path';

import sanityService from '../src/services/sanity.service';
import { getDataFromFile } from '../src/utils/getDataFromFile';
import {
  TSanityLocation,
  TSanityPatchLocationObj,
  TVariantWithLocations,
} from '../src/typescript/types';
import { mapSanityVariants } from '../src/utils/mapSanityVariants';

const filePath = path.resolve(__dirname, 'data', 'data.jsonl');

async function main() {
  try {
    const data = await getDataFromFile(filePath);
    const sanityData: TSanityLocation[] = await sanityService.getLocations();

    if (data) {
      const preparedSanityVariantsArr = mapSanityVariants(
        data?.variantsWithLocations as TVariantWithLocations[],
        sanityData
      );

      // const locationsResult =
      //   data?.locationsArr?.length > 0
      //     ? await sanityService.init_createLocations(data?.locationsArr)
      //     : [];

      for (const item of preparedSanityVariantsArr) {
        const res = await sanityService.init_updateSingleVariantWithLocations(
          item.variantId,
          item.locations as TSanityPatchLocationObj[]
        );

        console.log('res', res);
      }

      // const data1 = await sanityService.init_clearSingleVariantWithLocations()

      // console.log('data', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(error);
  }
}

main();
