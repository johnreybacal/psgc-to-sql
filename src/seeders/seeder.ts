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

export type CodeIdMapping = Record<string, any>;

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
