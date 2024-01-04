export type TVariant = {
  id: string;
  quantity: number;
};

export type TReversedVariant = {
  variantId: string;
  location: {
    id: string;
    quantity: number;
  };
};

type TVariantObj = {
  id: string;
  available: number;
  item: {
    id: string;
    variant: { id: string };
  };
  __parentId: string;
};

export function getVariantObj(line: string, reversed = false) {
  try {
    const variantObj: TVariantObj = JSON.parse(line);

    const variantIdStr = variantObj?.item?.variant?.id;
    const locationIdStr = variantObj?.__parentId;
    const available = variantObj?.available;

    const variantIdIdx = variantIdStr?.lastIndexOf('/');
    const locationIdIdx = locationIdStr?.lastIndexOf('/');

    if (variantIdIdx === -1 || locationIdIdx === -1) {
      return null;
    }

    const id = variantIdStr.slice(variantIdIdx + 1);
    const locationId = locationIdStr.slice(locationIdIdx + 1);

    if (reversed) {
      return {
        variantId: id,
        location: {
          id: locationId,
          quantity: available ?? 0,
        },
      };
    }

    return {
      locationId,
      variant: {
        id,
        quantity: available ?? 0,
      },
    };
  } catch (error) {
    console.log('getVariantObj parse error: ', error);
    return null;
  }
}
