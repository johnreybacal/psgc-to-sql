import {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import {
    BarangayDefinition,
    CityDefinition,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
} from "../definitions";
import { AbstractSeeder } from "./abstract";
import { CodeIdMapping, Seeder } from "./seeder";

class NormalizedSeeder extends AbstractSeeder implements Seeder {
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
