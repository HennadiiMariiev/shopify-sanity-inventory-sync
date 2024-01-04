import { open } from 'fs/promises';

import { TLocations, TLocationsWithVariants } from '../../src/typescript/types';
import { getLocationObj } from './getLocationObj';
import { TVariant, getVariantObj } from './getVariantObj';

export async function getLocationsWithVariantsFromFile(filePath: string) {
  try {
    const file = await open(filePath);

    const locationsWithVariants: TLocationsWithVariants[] = [];

    const locationsArr: TLocations[] = [];

    for await (const line of file.readLines()) {
      if (
        line.includes('shopify\\/Location\\/') &&
        !line.includes('__parentId')
      ) {
        const location = getLocationObj(line);

        if (location) {
          locationsArr.push(location);

          !locationsWithVariants.find(
            (item) => item.locationId === location.id
          ) &&
            locationsWithVariants.push({
              locationId: location.id,
              variants: [],
            });
        }
      }

      if (
        line.includes('shopify\\/Location\\/') &&
        line.includes('__parentId')
      ) {
        const obj = getVariantObj(line);

        if (obj) {
          const searchedLocationIdx = locationsWithVariants.findIndex(
            (item) => item.locationId === obj.locationId
          );

          if (searchedLocationIdx === -1) {
            locationsWithVariants.push({
              locationId: obj.locationId as string,
              variants: [obj.variant as TVariant],
            });
          } else {
            locationsWithVariants[searchedLocationIdx].variants.push(
              obj.variant as TVariant
            );
          }
        }
      }
    }

    return { locationsWithVariants, locationsArr };
  } catch (error) {
    console.log(error);
    return null;
  }
}
