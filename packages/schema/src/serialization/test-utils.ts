import { Schema } from '../schema/schema.ts';

export const TestObjectSchema = Schema.object({
    id: Schema.number(),
    description: Schema.string().describe('The description of the item.')
        .optional(),
    metadata: Schema.object({
        category: Schema.enum(['produce', 'electronics', 'software']),
        popularity: Schema.number().describe(
            'The popularity of the item given as an integer.',
        ),
        tags: Schema.array(Schema.string()),
    }),
});
