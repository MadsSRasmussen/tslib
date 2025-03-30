import type { SchemaSerializer } from '../types.ts';
import {
    ArraySchema,
    EnumSchema,
    ObjectSchema,
    type Schema,
} from '../../../mod.ts';
import { Validator } from './utils/validator.ts';
import { generateSchema } from './utils/generator.ts';

export class OpenAISerializer implements SchemaSerializer {
    serializable(data: Schema): object {
        switch (true) {
            case data instanceof EnumSchema:
                return {
                    type: data.isOptional ? [data.type, 'null'] : data.type,
                    enum: data.options,
                    ...(data.description && { description: data.description }),
                };
            case data instanceof ArraySchema:
                return {
                    type: data.isOptional ? [data.type, 'null'] : data.type,
                    items: this.serializable(data.schema),
                    ...(data.description && { description: data.description }),
                };
            case data instanceof ObjectSchema: {
                const entries = Object.entries(data.properties);
                const serializableEntries = entries.reduce<
                    Record<string, object>
                >((acc, [key, schema]) => {
                    acc[key] = this.serializable(schema);
                    return acc;
                }, {});
                const requiredEntries = entries.filter(([_, schema]) =>
                    schema.isOptional == false
                );
                return {
                    type: data.isOptional ? [data.type, 'null'] : data.type,
                    properties: serializableEntries,
                    required: requiredEntries.map(([key, _]) => key),
                    additionalProperties: false,
                    ...(data.description && { description: data.description }),
                };
            }
            default: {
                return {
                    type: data.isOptional ? [data.type, 'null'] : data.type,
                    ...(data.description && { description: data.description }),
                };
            }
        }
    }

    serialize(data: Schema): string {
        return JSON.stringify(this.serializable(data));
    }

    deserialize(serializedData: string): Schema {
        const object = JSON.parse(serializedData);
        if (!Validator.valid(object)) {
            throw new TypeError('Invalid data format');
        }
        return generateSchema(object);
    }
}
