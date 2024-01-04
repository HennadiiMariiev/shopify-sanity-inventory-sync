type TLocation = {
  id: string;
  name: string;
  address: { countryCode: string };
};

export function getLocationObj(line: string) {
  try {
    const locationObj: TLocation = JSON.parse(line);

    const name = locationObj?.name;
    const countryCode = locationObj?.address?.countryCode;

    const locationIdIdx = locationObj?.id?.lastIndexOf('/');

    if (locationIdIdx === -1) {
      return null;
    }

    const id = locationObj?.id?.slice(locationIdIdx + 1);

    return {
      id,
      name,
      countryCode,
    };
  } catch (error) {
    console.log('getLocationObj parse error: ', error);
    return null;
  }
}
