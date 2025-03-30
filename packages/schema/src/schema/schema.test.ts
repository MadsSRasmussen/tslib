import { Schema, StringSchema } from './schema.ts';
import { assertEquals, assertInstanceOf } from 'jsr:@std/assert';

Deno.test('schema class constructs correctly', () => {
    const stringSchema = Schema.string();
    const numberSchema = Schema.number();
    const booleanSchema = Schema.boolean();
    const enumSchema = Schema.enum(['success', 'error']);
    const arraySchema = Schema.array(Schema.string());
    const objectSchema = Schema.object({ content: Schema.string() });

    assertEquals(stringSchema.type, 'string');
    assertEquals(numberSchema.type, 'number');
    assertEquals(booleanSchema.type, 'boolean');

    assertEquals(enumSchema.type, 'string');
    assertEquals(enumSchema.options, ['success', 'error']);

    assertEquals(arraySchema.type, 'array');
    assertEquals(arraySchema.schema.type, 'string');

    assertEquals(objectSchema.type, 'object');
    assertInstanceOf(objectSchema.properties['content'], StringSchema);
});

Deno.test('schema class describes', () => {
    const stringSchema = Schema.string().describe('any string will do');

    assertEquals(stringSchema.description, 'any string will do');
});

Deno.test('schema class sets optional', () => {
    const stringSchema = Schema.string().optional();
    assertEquals(stringSchema.isOptional, true);
});
