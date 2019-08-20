import { SessionFilters } from "../../benefits-table";

export interface Chart {
    name: string;
    filters: SessionFilters;
    selected: Array<string>;
    view: string;
}