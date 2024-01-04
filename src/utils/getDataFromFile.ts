import { open } from 'fs/promises';

import { TLocations, TVariantWithLocations } from '../typescript/types';
import { TVariant, getVariantObj } from './getVariantObj';
import { getLocationObj } from './getLocationObj';

export async function getDataFromFile(filePath: string) {
  try {
    const file = await open(filePath);

    const locationsArr: TLocations[] = [];
    const variantsWithLocations: TVariantWithLocations[] = [];

    for await (const line of file.readLines()) {
      if (
        line.includes('shopify\\/Location\\/') &&
        !line.includes('__parentId')
      ) {
        const location = getLocationObj(line);

        if (location) {
          locationsArr.push(location);
        }
      }

      if (
        line.includes('shopify\\/Location\\/') &&
        line.includes('__parentId')
      ) {
        const obj = getVariantObj(line, true);

        if (obj) {
          const searchedVariant = variantsWithLocations.findIndex(
            (item) => item.variantId === obj.variantId
          );

          searchedVariant !== -1
            ? variantsWithLocations[searchedVariant].locations.push(
                obj.location as TVariant
              )
            : variantsWithLocations.push({
                variantId: obj.variantId as string,
                locations: [obj.location as TVariant],
              });
        }
      }
    }

    return { locationsArr, variantsWithLocations };
  } catch (error) {
    console.log(error);
    return null;
  }
}
