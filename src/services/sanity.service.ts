import sanityClient from '../config/sanity';
import { TLocations, TSanityPatchLocationObj } from '../typescript/types';

type TError = {
  message: string;
};
class SanityService {
  async getProducts() {
    try {
      const products = await sanityClient.fetch(
        `*[_type == "product" && store.status != 'draft']`
      );

      return products;
    } catch (error) {
      console.log('sanityService.getProducts error: ', error);
      return [];
    }
  }

  async getProductVariants() {
    try {
      const variants = await sanityClient.fetch(`*[_type == "productVariant"]`);

      return variants;
    } catch (error) {
      console.log('sanityService.getProductVariants error: ', error);
      return [];
    }
  }

  async getLocations() {
    try {
      return await sanityClient.fetch(`*[_type == "location"]`);
    } catch (error) {
      console.log('sanityService.getLocations error: ', error);
      return [];
    }
  }

  async init_updateSingleVariantWithLocations(
    _id: string,
    locations: TSanityPatchLocationObj[]
  ) {
    try {
      const res = await sanityClient
        .patch(_id)
        .setIfMissing({
          locations: [],
        })
        .append('locations', locations)
        .commit({ autoGenerateArrayKeys: true });

      return res;
    } catch (error) {
      console.log(
        'sanityService.init_updateSingleVariantWithLocations error: ',
        (error as TError)?.message
      );
      return null;
    }
  }

  async init_deleteSingleVariantLocations(_id: string) {
    try {
      const res = await sanityClient
        .patch(_id)
        .setIfMissing({
          locations: [],
        })
        .set({
          locations: [],
        })
        .commit();

      return res;
    } catch (error) {
      console.log(
        'sanityService.init_deleteSingleVariantLocations error: ',
        error
      );
      return null;
    }
  }

  async init_createLocations(locationsArr: TLocations[]) {
    try {
      const result = [];

      for (const location of locationsArr) {
        const res = await sanityClient.create({
          ...location,
          _type: 'location',
        });

        if (res) {
          result.push(res);
        }
      }

      return result;
    } catch (error) {
      console.log('sanityService.init_createLocations error: ', error);
      return [];
    }
  }

  async init_deleteLocations() {
    try {
      const variants = await sanityClient.fetch(`*[_type == "productVariant"] {
        _id
      }`);

      for (const variant of variants) {
        if (variant?._id) {
          await this.init_deleteSingleVariantLocations(variant?._id);
        }
      }

      const res = await sanityClient.delete({
        query: `*[_type == "location"]`,
      });

      return res;
    } catch (error) {
      console.log('sanityService.init_deleteLocations error: ', error);
      return [];
    }
  }
}

const sanityService = new SanityService();

export default sanityService;
