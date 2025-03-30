import type {
    ArraySchema,
    BooleanSchema,
    EnumSchema,
    NumberSchema,
    ObjectSchema,
    PrimitiveSchema,
    StringSchema,
} from '../../../../mod.ts';
import type {
    ArrayObject,
    EnumObject,
    MinimumValidObject,
    ObjectObject,
    PrimitiveObject,
    SchemaObject,
} from '../types.ts';
import { Schema } from '../../../../mod.ts';
import { Validator } from './validator.ts';

export function generateSchema<T extends MinimumValidObject>(data: T): Schema {
    if (typeof data.type === 'string') {
        switch (data.type) {
            case 'string': {
                if (Validator.enum(data)) return Generator.enum(data);
                if (!Validator.primitive(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.primitive(data);
            }
            case 'array': {
                if (!Validator.array(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.array(data);
            }
            case 'object': {
                if (!Validator.object(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.object(data);
            }
            default: {
                if (!Validator.primitive(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.primitive(data);
            }
        }
    } else if (Array.isArray(data.type)) {
        const [type, _] = data.type;
        switch (type) {
            case 'string': {
                if (Validator.enum(data)) return Generator.enum(data);
                else if (Validator.primitive(data)) {
                    return Generator.primitive(data);
                }
                throw new TypeError('Invalid data format');
            }
            case 'array': {
                if (!Validator.array(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.array(data);
            }
            case 'object': {
                if (!Validator.object(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.object(data);
            }
            default: {
                if (!Validator.primitive(data)) {
                    throw new TypeError('Invalid data format');
                }
                return Generator.primitive(data);
            }
        }
    }

    throw new TypeError('Invalid data format');
}

const Generator = {
    primitive: function (data: PrimitiveObject): PrimitiveSchema {
        if (typeof data.type === 'string') {
            switch (data.type) {
                case 'string': {
                    const schema: StringSchema = Schema.string();
                    if (data.description) schema.describe(data.description);
                    return schema;
                }
                case 'number': {
                    const schema: NumberSchema = Schema.number();
                    if (data.description) schema.describe(data.description);
                    return schema;
                }
                case 'boolean': {
                    const schema: BooleanSchema = Schema.boolean();
                    if (data.description) schema.describe(data.description);
                    return schema;
                }
            }
        } else if (Array.isArray(data.type)) {
            const [type, _] = data.type;
            switch (type) {
                case 'string': {
                    const schema: StringSchema = Schema.string()
                        .optional();
                    if (data.description) schema.describe(data.description);
                    return schema;
                }
                case 'number': {
                    const schema: NumberSchema = Schema.number()
                        .optional();
                    if (data.description) schema.describe(data.description);
                    return schema;
                }
                case 'boolean': {
                    const schema: BooleanSchema = Schema.boolean()
                        .optional();
                    if (data.description) schema.describe(data.description);
                    return schema;
                }
            }
        }

        throw new TypeError('Invalid data format');
    },
    enum: function (data: EnumObject): EnumSchema {
        const schema: EnumSchema = Schema.enum(data.enum);
        if (data.description) schema.describe(data.description);
        checkOptional(schema, data);
        return schema;
    },
    array: function generateArray(data: ArrayObject): ArraySchema {
        const schema: ArraySchema = Schema.array(
            generateSchema(data.items),
        );
        if (data.description) schema.describe(data.description);
        checkOptional(schema, data);
        return schema;
    },
    object: function (data: ObjectObject): ObjectSchema {
        const properties: Record<string, Schema> = (function () {
            const entries = Object.entries(data.properties);
            return entries.reduce<Record<string, Schema>>(
                (acc, [key, schemaObject]) => {
                    acc[key] = generateSchema(schemaObject);
                    return acc;
                },
                {},
            );
        })();

        const schema: ObjectSchema = Schema.object(properties);
        if (data.description) schema.describe(data.description);
        checkOptional(schema, data);
        return schema;
    },
};

function checkOptional(schema: Schema, data: SchemaObject): Schema {
    if (typeof data.type === 'string') return schema;
    else if (Array.isArray(data.type)) return schema.optional();

    throw new TypeError('Invalid data format');
}
