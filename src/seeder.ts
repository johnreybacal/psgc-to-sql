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

export interface DataPersister {
    saveRegions(definition: RegionDefinition);
    saveProvinces(regionIds: CodeIdMapping, definition: ProvinceDefinition);
    saveCities(
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping,
        definition: CityDefinition
    );
    saveMunicipalities(
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping,
        definition: MunicipalityDefinition
    );
    saveSubMunicipalities(
        cityIds: CodeIdMapping,
        definition: SubMunicipalityDefinition
    );
    saveBarangays(
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping,
        definition: BarangayDefinition
    );
}

export abstract class AbstractDataPersister implements DataPersister {
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

    async saveRegions(definition: RegionDefinition) {
        const regions = [];

        for (const region of this.regions) {
            const reg = this.Region.build();
            utils.setBaseValue<RegionDefinition>(reg, definition, region);
            regions.push(reg.toJSON());
        }

        const createdRecords = await this.Region.bulkCreate(regions);

        return this.mapIds(definition, createdRecords);
    }

    async saveProvinces(
        regionIds: CodeIdMapping,
        definition: ProvinceDefinition
    ) {
        const provinces = [];

        for (const province of this.provinces) {
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

            provinces.push(prov.toJSON());
        }

        const createdRecords = await this.Province.bulkCreate(provinces);

        return this.mapIds(definition, createdRecords);
    }

    async saveCities(
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping,
        definition: CityDefinition
    ) {
        const cities = [];

        for (const city of this.cities) {
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

            cities.push(ct.toJSON());
        }

        const createdRecords = await this.City.bulkCreate(cities);

        return this.mapIds(definition, createdRecords);
    }

    async saveMunicipalities(
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping,
        definition: MunicipalityDefinition
    ) {
        const municipalityIds: CodeIdMapping = {};
        const municipalities = [];

        for (const municipality of this.municipalities) {
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

            municipalities.push(mn.toJSON());
        }

        const createdRecords = await this.Municipality.bulkCreate(
            municipalities
        );

        return this.mapIds(definition, createdRecords);
    }

    async saveSubMunicipalities(
        cityIds: CodeIdMapping,
        definition: SubMunicipalityDefinition
    ) {
        const subMunicipalities = [];

        for (const subMunicipality of this.subMunicipalities) {
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
            subMunicipalities.push(sm.toJSON());
        }

        const createdRecords = await this.SubMunicipality.bulkCreate(
            subMunicipalities
        );

        return this.mapIds(definition, createdRecords);
    }
    async saveBarangays(
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping,
        definition: BarangayDefinition
    ) {
        const barangays = [];

        for (const barangay of this.barangays) {
            const br = this.SubMunicipality.build();

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
            barangays.push(br.toJSON());
        }

        const createdRecords = await this.Barangay.bulkCreate(barangays);

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
