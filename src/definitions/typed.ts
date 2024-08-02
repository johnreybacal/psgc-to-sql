import BaseDefinition from "./base";

export default interface TypedDefinition extends BaseDefinition {
    type: string;
    typeAlias?: {
        Reg?: string;
        Prov?: string;
        City?: string;
        Mun?: string;
        SubMun?: string;
        Bgy?: string;
    };
}
