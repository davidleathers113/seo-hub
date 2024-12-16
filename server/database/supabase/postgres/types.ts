import { QueryResultRow } from 'pg';

export interface OutlineSectionRow extends QueryResultRow {
    title: string;
    content_points: string; // JSON string
    order_index: number;
    content?: string;
}

export interface WhereClauseResult {
    clause: string;
    values: any[];
    nextParamCount: number;
}
