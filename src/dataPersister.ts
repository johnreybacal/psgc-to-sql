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
    CityDefinition,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
} from "./definitions";
import { utils } from "./definitions/util";

interface DataPersister {
    saveRegions(regionDefinition: RegionDefinition);
    saveProvinces(
        regionIds: Record<string, any>,
        provinceDefinition: ProvinceDefinition
    );
    saveCities(
        regionIds: Record<string, any>,
        provinceIds: Record<string, any>,
        cityDefinition: CityDefinition
    );
    saveMunicipalities(
        regionIds: Record<string, any>,
        provinceIds: Record<string, any>,
        municipalityDefinition: MunicipalityDefinition
    );
}

export abstract class AbstractDataPersister implements DataPersister {
    Region: ModelStatic<Model<any, any>>;
    Province: ModelStatic<Model<any, any>>;
    City: ModelStatic<Model<any, any>>;
    Municipality: ModelStatic<Model<any, any>>;

    regions: Region[];
    provinces: Province[];
    cities: City[];
    municipalities: Municipality[];
    subMunicipalities: SubMunicipality[];
    barangays: Barangay[];

    async saveRegions(regionDefinition: RegionDefinition) {
        const regionIds: Record<string, any> = {};
        const regions = [];

        for (const region of this.regions) {
            const reg = this.Region.build();
            utils.setBaseValue<RegionDefinition>(reg, regionDefinition, region);
            regions.push(reg.toJSON());
        }

        const createdRegions = await this.Region.bulkCreate(regions);

        for (const region of createdRegions) {
            regionIds[region[regionDefinition.code]] =
                region[regionDefinition.id!];
        }

        return regionIds;
    }

    async saveProvinces(
        regionIds: Record<string, any>,
        provinceDefinition: ProvinceDefinition
    ) {
        const provinceIds: Record<string, any> = {};
        const provinces = [];

        for (const province of this.provinces) {
            const prov = this.Province.build();

            utils.setBaseValue<ProvinceDefinition>(
                prov,
                provinceDefinition,
                province
            );
            utils.setValueIfDefined<ProvinceDefinition>(
                prov,
                provinceDefinition,
                "regionId",
                regionIds[province.region.code]
            );
            utils.setValueIfDefined<ProvinceDefinition>(
                prov,
                provinceDefinition,
                "incomeClassification",
                province.incomeClassification
            );

            provinces.push(prov.toJSON());
        }

        const createdProvinces = await this.Province.bulkCreate(provinces);

        for (const province of createdProvinces) {
            provinceIds[province[provinceDefinition.code]] =
                province[provinceDefinition.id!];
        }

        return provinceIds;
    }

    async saveCities(
        regionIds: Record<string, any>,
        provinceIds: Record<string, any>,
        cityDefinition: CityDefinition
    ) {
        const cities = [];

        for (const city of this.cities) {
            const ct = this.City.build();

            utils.setBaseValue<CityDefinition>(ct, cityDefinition, city);

            // HUC does not have province, HUC are directly under region
            if (city.class !== "HUC") {
                if (city.province) {
                    utils.setValueIfDefined<CityDefinition>(
                        ct,
                        cityDefinition,
                        "provinceId",
                        provinceIds[city.province.code]
                    );
                    utils.setValueIfDefined<CityDefinition>(
                        ct,
                        cityDefinition,
                        "regionId",
                        regionIds[city.province.region.code]
                    );
                }
            } else {
                if (city.region) {
                    utils.setValueIfDefined<CityDefinition>(
                        ct,
                        cityDefinition,
                        "regionId",
                        regionIds[city.region.code]
                    );
                }
            }

            utils.setValueIfDefined<CityDefinition>(
                ct,
                cityDefinition,
                "class",
                city.class
            );
            utils.setValueIfDefined<CityDefinition>(
                ct,
                cityDefinition,
                "incomeClassification",
                city.incomeClassification
            );

            cities.push(ct.toJSON());
        }

        await this.City.bulkCreate(cities);
    }

    async saveMunicipalities(
        regionIds: Record<string, any>,
        provinceIds: Record<string, any>,
        municipalityDefinition: MunicipalityDefinition
    ) {
        const municipalities = [];

        for (const municipality of this.municipalities) {
            const mn = this.Municipality.build();

            utils.setBaseValue<MunicipalityDefinition>(
                mn,
                municipalityDefinition,
                municipality
            );

            if (municipality.province) {
                utils.setValueIfDefined<MunicipalityDefinition>(
                    mn,
                    municipalityDefinition,
                    "provinceId",
                    provinceIds[municipality.province?.code ?? ""]
                );
            }
            if (municipality.region) {
                utils.setValueIfDefined<MunicipalityDefinition>(
                    mn,
                    municipalityDefinition,
                    "regionId",
                    regionIds[municipality.region!.code]
                );
            }
            utils.setValueIfDefined<MunicipalityDefinition>(
                mn,
                municipalityDefinition,
                "incomeClassification",
                municipality.incomeClassification
            );

            municipalities.push(mn.toJSON());
        }

        await this.Municipality.bulkCreate(municipalities);
    }
}
