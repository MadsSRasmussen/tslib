import type { PrimitiveSchemaType } from '../../schema/types.ts';

export type SchemaObject =
    | PrimitiveObject
    | EnumObject
    | ArrayObject
    | ObjectObject;

export type PrimitiveObject = {
    type: PrimitiveSchemaType;
    description?: string;
} | {
    type: [PrimitiveSchemaType, 'null'];
    description?: string;
};

export type EnumObject = {
    type: 'string';
    enum: string[];
    description?: string;
} | {
    type: ['string', 'null'];
    enum: string[];
    description?: string;
};

export type ArrayObject = {
    type: 'array';
    items: SchemaObject;
    description?: string;
} | {
    type: ['array', 'null'];
    items: SchemaObject;
    description?: string;
};

export type ObjectObject = {
    type: 'object';
    properties: Record<string, SchemaObject>;
    required: string[];
    additionalProperties: boolean;
    description?: string;
} | {
    type: ['object', 'null'];
    properties: Record<string, SchemaObject>;
    required: string[];
    additionalProperties: boolean;
    description?: string;
};

export type MinimumValidObject = { type: string } | { type: [string, 'null'] };
