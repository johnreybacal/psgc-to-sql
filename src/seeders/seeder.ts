import {
    Barangay,
    City,
    Municipality,
    Province,
    Region,
    SubMunicipality,
} from "psgc-reader";
import { Sequelize } from "sequelize";
import {
    BarangayDefinition,
    CityDefinition,
    MunicipalityDefinition,
    ProvinceDefinition,
    RegionDefinition,
    SubMunicipalityDefinition,
} from "../definitions";

export type CodeIdMapping = Record<string, any>;

export interface Seeder {
    setSequelize(sequelize: Sequelize);
    saveRegions(definition: RegionDefinition, regions: Region[]): CodeIdMapping;
    saveProvinces(
        definition: ProvinceDefinition,
        provinces: Province[],
        regionIds: CodeIdMapping
    ): CodeIdMapping;
    saveCities(
        definition: CityDefinition,
        cities: City[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ): CodeIdMapping;
    saveMunicipalities(
        definition: MunicipalityDefinition,
        municipalities: Municipality[],
        regionIds: CodeIdMapping,
        provinceIds: CodeIdMapping
    ): CodeIdMapping;
    saveSubMunicipalities(
        definition: SubMunicipalityDefinition,
        subMunicipalities: SubMunicipality[],
        cityIds: CodeIdMapping
    ): CodeIdMapping;
    saveBarangays(
        definition: BarangayDefinition,
        barangays: Barangay[],
        cityIds: CodeIdMapping,
        municipalityIds: CodeIdMapping,
        subMunicipalityIds: CodeIdMapping
    ): CodeIdMapping;
}
