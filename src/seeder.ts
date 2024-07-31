import {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { Model, ModelStatic } from "sequelize";
import {
    BarangayDefinition,
    BaseDefinition,
    CityDefinition,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
} from "./definitions";
import { utils } from "./definitions/util";

type CodeIdMapping = Record<string, any>;

export interface Seeder {
    saveRegions(definition: RegionDefinition, regions: Region[]);
    saveProvinces(
        definition: ProvinceDefinition,
        provinces: Province[],
        regionIds: CodeIdMapping
    );
    saveCities(
        definition: CityDefinition,
        cities: City[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    );
    saveMunicipalities(
        definition: MunicipalityDefinition,
        municipalities: Municipality[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    );
    saveSubMunicipalities(
        definition: SubMunicipalityDefinition,
        subMunicipalities: SubMunicipality[],
        cityIds: CodeIdMapping
    );
    saveBarangays(
        definition: BarangayDefinition,
        barangays: Barangay[],
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping
    );
}

export abstract class AbstractSeeder implements Seeder {
    Region: ModelStatic<Model<any, any>>;
    Province: ModelStatic<Model<any, any>>;
    City: ModelStatic<Model<any, any>>;
    Municipality: ModelStatic<Model<any, any>>;
    SubMunicipality: ModelStatic<Model<any, any>>;
    Barangay: ModelStatic<Model<any, any>>;

    regions: Region[];
    provinces: Province[];
    cities: City[];
    municipalities: Municipality[];
    subMunicipalities: SubMunicipality[];
    barangays: Barangay[];

    async saveRegions(definition: RegionDefinition, regions: Region[]) {
        const locations = [];

        for (const region of regions) {
            const reg = this.Region.build();
            utils.setBaseValue<RegionDefinition>(reg, definition, region);
            locations.push(reg.toJSON());
        }

        const createdRecords = await this.Region.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    async saveProvinces(
        definition: ProvinceDefinition,
        provinces: Province[],
        regionIds: CodeIdMapping
    ) {
        const locations = [];

        for (const province of provinces) {
            const prov = this.Province.build();

            utils.setBaseValue<ProvinceDefinition>(prov, definition, province);
            utils.setValueIfDefined<ProvinceDefinition>(
                prov,
                definition,
                "regionId",
                regionIds[province.region.code]
            );
            utils.setValueIfDefined<ProvinceDefinition>(
                prov,
                definition,
                "incomeClassification",
                province.incomeClassification
            );

            locations.push(prov.toJSON());
        }

        const createdRecords = await this.Province.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    async saveCities(
        definition: CityDefinition,
        cities: City[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ) {
        const locations = [];

        for (const city of cities) {
            const ct = this.City.build();

            utils.setBaseValue<CityDefinition>(ct, definition, city);

            // HUC does not have province, HUC are directly under region
            if (city.class !== "HUC") {
                if (city.province) {
                    utils.setValueIfDefined<CityDefinition>(
                        ct,
                        definition,
                        "provinceId",
                        provinceIds[city.province.code]
                    );
                    utils.setValueIfDefined<CityDefinition>(
                        ct,
                        definition,
                        "regionId",
                        regionIds[city.province.region.code]
                    );
                }
            } else {
                if (city.region) {
                    utils.setValueIfDefined<CityDefinition>(
                        ct,
                        definition,
                        "regionId",
                        regionIds[city.region.code]
                    );
                }
            }

            utils.setValueIfDefined<CityDefinition>(
                ct,
                definition,
                "class",
                city.class
            );
            utils.setValueIfDefined<CityDefinition>(
                ct,
                definition,
                "incomeClassification",
                city.incomeClassification
            );

            locations.push(ct.toJSON());
        }

        const createdRecords = await this.City.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    async saveMunicipalities(
        definition: MunicipalityDefinition,
        municipalities: Municipality[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ) {
        const municipalityIds: CodeIdMapping = {};
        const locations = [];

        for (const municipality of municipalities) {
            const mn = this.Municipality.build();

            utils.setBaseValue<MunicipalityDefinition>(
                mn,
                definition,
                municipality
            );

            if (municipality.province) {
                utils.setValueIfDefined<MunicipalityDefinition>(
                    mn,
                    definition,
                    "provinceId",
                    provinceIds[municipality.province?.code ?? ""]
                );
            }
            if (municipality.region) {
                utils.setValueIfDefined<MunicipalityDefinition>(
                    mn,
                    definition,
                    "regionId",
                    regionIds[municipality.region!.code]
                );
            }
            utils.setValueIfDefined<MunicipalityDefinition>(
                mn,
                definition,
                "incomeClassification",
                municipality.incomeClassification
            );

            locations.push(mn.toJSON());
        }

        const createdRecords = await this.Municipality.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    async saveSubMunicipalities(
        definition: SubMunicipalityDefinition,
        subMunicipalities: SubMunicipality[],
        cityIds: CodeIdMapping
    ) {
        const locations = [];

        for (const subMunicipality of subMunicipalities) {
            const sm = this.SubMunicipality.build();

            utils.setBaseValue<SubMunicipalityDefinition>(
                sm,
                definition,
                subMunicipality
            );

            utils.setValueIfDefined<SubMunicipalityDefinition>(
                sm,
                definition,
                "cityId",
                cityIds[subMunicipality.city.code]
            );
            locations.push(sm.toJSON());
        }

        const createdRecords = await this.SubMunicipality.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }
    async saveBarangays(
        definition: BarangayDefinition,
        barangays: Barangay[],
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping
    ) {
        const locations = [];

        for (const barangay of barangays) {
            const br = this.Barangay.build();

            utils.setBaseValue<BarangayDefinition>(br, definition, barangay);

            if (barangay.subMunicipality) {
                utils.setValueIfDefined<BarangayDefinition>(
                    br,
                    definition,
                    "subMunicipalityId",
                    subMunicipalityIds[barangay.subMunicipality.code]
                );
            } else if (barangay.municipality) {
                utils.setValueIfDefined<BarangayDefinition>(
                    br,
                    definition,
                    "municipalityId",
                    municipalityIds[barangay.municipality.code]
                );
            } else if (barangay.city) {
                utils.setValueIfDefined<BarangayDefinition>(
                    br,
                    definition,
                    "cityId",
                    cityIds[barangay.city.code]
                );
            }
            locations.push(br.toJSON());
        }

        const createdRecords = await this.Barangay.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    mapIds(definition: BaseDefinition, createdLocations: Model<any, any>[]) {
        const ids: CodeIdMapping = {};
        for (const location of createdLocations) {
            ids[location[definition.code]] = location[definition.id!];
        }

        return ids;
    }
}
