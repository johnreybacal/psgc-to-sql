import { Definitions } from "./definitions";

export const defaults: Definitions = {
    region: {
        id: "id",
        code: "code",
        name: "name",
    },
    province: {
        id: "id",
        code: "code",
        name: "name",
        regionId: "region_id",
    },
    city: {
        id: "id",
        code: "code",
        name: "name",
        class: "class",
        regionId: "region_id",
        provinceId: "province_id",
    },
    municipality: {
        id: "id",
        code: "code",
        name: "name",
        regionId: "region_id",
        provinceId: "province_id",
    },
    subMunicipality: {
        id: "id",
        code: "code",
        name: "name",
        cityId: "city_id",
    },
    barangay: {
        id: "id",
        code: "code",
        name: "name",
        cityId: "city_id",
        municipalityId: "municipality_id",
        subMunicipalityId: "subMunicipality_id",
    },
};
