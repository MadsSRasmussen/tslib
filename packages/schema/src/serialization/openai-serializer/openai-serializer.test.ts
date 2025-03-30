import { OpenAISerializer } from './openai-serializer.ts';
import { TestObjectSchema } from '../test-utils.ts';
import { assertEquals } from 'jsr:@std/assert';

const TestObjectSerializable = {
    type: 'object',
    properties: {
        id: {
            type: 'number',
        },
        description: {
            type: ['string', 'null'],
            description: 'The description of the item.',
        },
        metadata: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    enum: ['produce', 'electronics', 'software'],
                },
                popularity: {
                    type: 'number',
                    description:
                        'The popularity of the item given as an integer.',
                },
                tags: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
            required: ['category', 'popularity', 'tags'],
            additionalProperties: false,
        },
    },
    required: ['id', 'metadata'],
    additionalProperties: false,
};

Deno.test('openai-serializer serializes correctly', () => {
    const serializer = new OpenAISerializer();

    const serializable = serializer.serializable(TestObjectSchema);
    assertEquals(serializable, TestObjectSerializable);

    const serialized = serializer.serialize(TestObjectSchema);
    assertEquals(serialized, JSON.stringify(TestObjectSerializable));
});
