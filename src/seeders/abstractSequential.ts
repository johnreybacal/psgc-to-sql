import {
    Barangay,
    City,
    Municipality,
    Province,
    PsgcReaderResult,
    PsgcRecord,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { Model, Sequelize } from "sequelize";
import {
    BarangayDefinition,
    BaseDefinition,
    CityDefinition,
    Definitions,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
    TypedDefinition,
} from "../definitions";
import { utils } from "../definitions/util";
import { CodeIdMapping, SequentialSeeder } from "./sequential";

export abstract class AbstractSequentialSeeder implements SequentialSeeder {
    protected sequelize: Sequelize;
    protected definitions: Definitions;

    public setSequelize(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    seed(definition: Definitions, data: PsgcReaderResult);
    seed(definition: TypedDefinition, records: PsgcRecord[]);
    async seed(definition: unknown, records: unknown) {
        if (arguments[0].instanceOf === "Definitions") {
            this.definitions = arguments[0] as Definitions;
            const psgc = arguments[1] as PsgcReaderResult;

            const regionIds = await this.saveRegions(
                this.definitions.region,
                psgc.regions
            );

            const provinceIds = await this.saveProvinces(
                this.definitions.province,
                psgc.provinces,
                regionIds
            );
            const cityIds = await this.saveCities(
                this.definitions.city,
                psgc.cities,
                regionIds,
                provinceIds
            );
            const municipalityIds = await this.saveMunicipalities(
                this.definitions.municipality,
                psgc.municipalities,
                regionIds,
                provinceIds
            );
            const subMunicipalityIds = await this.saveSubMunicipalities(
                this.definitions.subMunicipality,
                psgc.subMunicipalities,
                cityIds
            );
            await this.saveBarangays(
                this.definitions.barangay,
                psgc.barangays,
                cityIds,
                municipalityIds,
                subMunicipalityIds
            );
        } else {
            throw Error("Invalid arguments");
        }
    }

    public async saveRegions(definition: RegionDefinition, regions: Region[]) {
        const Region = this.sequelize.model(definition.modelName);
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
        const Province = this.sequelize.model(definition.modelName);
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
        const City = this.sequelize.model(definition.modelName);
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
        const Municipality = this.sequelize.model(definition.modelName);
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
        const SubMunicipality = this.sequelize.model(definition.modelName);
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
        const Barangay = this.sequelize.model(definition.modelName);
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
