export const LOCATION_FORM_FIELDS = {
  COUNTRY_CODE: "countryCode",
  CITY_CODE: "cityCode",
} as const;

export type LocationFormData = {
  [LOCATION_FORM_FIELDS.COUNTRY_CODE]: string;
  [LOCATION_FORM_FIELDS.CITY_CODE]: string;
};
