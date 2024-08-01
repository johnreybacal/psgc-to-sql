import {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { Model, Sequelize } from "sequelize";
import {
    BarangayDefinition,
    BaseDefinition,
    CityDefinition,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
} from "../definitions";
import { utils } from "../definitions/util";
import { CodeIdMapping, Seeder } from "./seeder";

export abstract class AbstractSeeder implements Seeder {
    protected sequelize: Sequelize;

    public setSequelize(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    public async saveRegions(definition: RegionDefinition, regions: Region[]) {
        const Region = this.sequelize.model("Region");
        const locations = [];

        for (const region of regions) {
            const rg = Region.build();
            utils.setBaseValue<RegionDefinition>(rg, definition, region);
            locations.push(rg.toJSON());
        }

        const createdRecords = await Region.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    public async saveProvinces(
        definition: ProvinceDefinition,
        provinces: Province[],
        regionIds: CodeIdMapping
    ) {
        const Province = this.sequelize.model("Province");
        const locations = [];

        for (const province of provinces) {
            const pr = Province.build();

            utils.setBaseValue<ProvinceDefinition>(pr, definition, province);
            utils.setValueIfDefined<ProvinceDefinition>(
                pr,
                definition,
                "regionId",
                regionIds[province.region.code]
            );
            utils.setValueIfDefined<ProvinceDefinition>(
                pr,
                definition,
                "incomeClassification",
                province.incomeClassification
            );

            locations.push(pr.toJSON());
        }

        const createdRecords = await Province.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    public async saveCities(
        definition: CityDefinition,
        cities: City[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ) {
        const City = this.sequelize.model("City");
        const locations = [];

        for (const city of cities) {
            const ct = City.build();

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

        const createdRecords = await City.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    public async saveMunicipalities(
        definition: MunicipalityDefinition,
        municipalities: Municipality[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ) {
        const Municipality = this.sequelize.model("Municipality");
        const locations = [];

        for (const municipality of municipalities) {
            const mn = Municipality.build();

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

        const createdRecords = await Municipality.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    public async saveSubMunicipalities(
        definition: SubMunicipalityDefinition,
        subMunicipalities: SubMunicipality[],
        cityIds: CodeIdMapping
    ) {
        const SubMunicipality = this.sequelize.model("SubMunicipality");
        const locations = [];

        for (const subMunicipality of subMunicipalities) {
            const sm = SubMunicipality.build();

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

        const createdRecords = await SubMunicipality.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    public async saveBarangays(
        definition: BarangayDefinition,
        barangays: Barangay[],
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping
    ) {
        const Barangay = this.sequelize.model("Barangay");
        const locations = [];

        for (const barangay of barangays) {
            const br = Barangay.build();

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

        const createdRecords = await Barangay.bulkCreate(locations);

        return this.mapIds(definition, createdRecords);
    }

    private mapIds(
        definition: BaseDefinition,
        createdLocations: Model<any, any>[]
    ) {
        const ids: CodeIdMapping = {};
        for (const location of createdLocations) {
            ids[location[definition.code]] = location[definition.id!];
        }

        return ids;
    }
}
