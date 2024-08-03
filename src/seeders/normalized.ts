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
import {
    BarangayDefinition,
    CityDefinition,
    Definitions,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
    TypedDefinition,
} from "../definitions";
import { AbstractSequentialSeeder } from "./abstractSequential";
import { Seeder } from "./seeder";
import { CodeIdMapping } from "./sequential";

export class NormalizedSeeder
    extends AbstractSequentialSeeder
    implements Seeder
{
    seed(definition: Definitions, data: PsgcReaderResult);
    seed(definition: TypedDefinition, records: PsgcRecord[]);

    async seed() {
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

    async saveRegions(definition: RegionDefinition, regions: Region[]) {
        if (!definition.id) {
            throw new Error("id is not defined in RegionDefinition");
        }
        return await super.saveRegions(definition, regions);
    }
    async saveProvinces(
        definition: ProvinceDefinition,
        provinces: Province[],
        regionIds: CodeIdMapping
    ) {
        if (!definition.id) {
            throw new Error("id is not defined in ProvinceDefinition");
        }
        if (!definition.regionId) {
            throw new Error("regionId is not defined in ProvinceDefinition");
        }
        return await super.saveProvinces(definition, provinces, regionIds);
    }
    async saveCities(
        definition: CityDefinition,
        cities: City[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ) {
        if (!definition.id) {
            throw new Error("id is not defined in CityDefinition");
        }
        if (!definition.regionId) {
            throw new Error("regionId is not defined in CityDefinition");
        }
        if (!definition.provinceId) {
            throw new Error("provinceId is not defined in CityDefinition");
        }
        return await super.saveCities(
            definition,
            cities,
            regionIds,
            provinceIds
        );
    }
    async saveMunicipalities(
        definition: MunicipalityDefinition,
        municipalities: Municipality[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ) {
        if (!definition.id) {
            throw new Error("id is not defined in MunicipalityDefinition");
        }
        if (!definition.regionId) {
            throw new Error(
                "regionId is not defined in MunicipalityDefinition"
            );
        }
        if (!definition.provinceId) {
            throw new Error(
                "provinceId is not defined in MunicipalityDefinition"
            );
        }
        return await super.saveMunicipalities(
            definition,
            municipalities,
            regionIds,
            provinceIds
        );
    }
    async saveSubMunicipalities(
        definition: SubMunicipalityDefinition,
        subMunicipalities: SubMunicipality[],
        cityIds: CodeIdMapping
    ) {
        if (!definition.id) {
            throw new Error("id is not defined in SubMunicipalityDefinition");
        }
        if (!definition.cityId) {
            throw new Error(
                "cityId is not defined in SubMunicipalityDefinition"
            );
        }
        return await super.saveSubMunicipalities(
            definition,
            subMunicipalities,
            cityIds
        );
    }
    async saveBarangays(
        definition: BarangayDefinition,
        barangays: Barangay[],
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping
    ) {
        if (!definition.id) {
            throw new Error("id is not defined in BarangayDefinition");
        }
        if (!definition.cityId) {
            throw new Error("cityId is not defined in BarangayDefinition");
        }
        if (!definition.municipalityId) {
            throw new Error(
                "municipalityId is not defined in BarangayDefinition"
            );
        }
        if (!definition.subMunicipalityId) {
            throw new Error(
                "subMunicipalityId is not defined in BarangayDefinition"
            );
        }
        return await super.saveBarangays(
            definition,
            barangays,
            cityIds,
            municipalityIds,
            subMunicipalityIds
        );
    }
}
