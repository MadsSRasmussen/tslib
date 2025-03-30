# Serializeable schema declerations in Typescript

**Schema** is a serializeable shcema decleration library written in typescript. The developer experience of declaring a schema is inspirred by that of `Zod`.
Features of the library includes:

- Define typescript schema declerations via a fluent interface.
- Serialize and parse shcmea definitions via different serialization methods.

The library was originally developed to facilitate function-calling-definitions in a unified way to different ai-providers.

#### Table of contents:
- [Installation](#installation)
- [Usage](#usage)
- [Serializers](#serializers)

#### Installation

##### Using Deno:

The Schema library is on `jsr` under `@msrass/schema`. You can include the library directly in a deno project with:

```ts
import { Schema as s } from 'jsr:@msrass/schema';
```

Or using the `deno add` command:

```bash
deno add jsr:@msrass/schema
```

#### Usage

To declare a schema, simply import the abstract Schema class from the module:
```ts
import { Schema as s } from '@msrass/schema';

const objectSchema = s.object({
    stringSchema: s.string(),
    numberSchema: s.number().describe('Only cool numbers for this field...'), // Add a description
    enumSchema: s.enum(['foo', 'bar']).optional(), // Make the value nullable
    arraySchema: s.array(s.boolean())
});
```
*Note that schemas marked as optional are nullable on their own, but can be undefined when nested in an object schema.*

To serialize a schema; import a serializer and thereby select a serialization format:

```ts
import { Schema as s } from '@msrass/schema';
import { OpenAISerializer } from '@msrass/schema/serialization';

const schema = Schema.string().describe('Serialilze me!');

const serializer = new OpenAISerializer();

const serializedSchema = serializer.serialize(schema);

// The serialized schema again be deserialized to obtain a Schema instance
const deserializedSchema = serializer.deserialize(serializedSchema); // Schema instance
```

#### Serializers

The following is a complete list of all serializers available:

- [OpenAISerializer](#openaiserializer)

##### OpenAISerializer

The OpenAISerializer serializes data in a format that is directly compatible with the OpenAI api.

The following is how the `objectSchema` specified in the usage example would be serialized:
```json
{
    "type": "object",
    "properties": {
        "stringSchema": {
            "type": "string"
        },
        "numberSchema": {
            "type": "number",
            "description": "Only cool numbers for this field..."
        },
        "enumSchema": {
            "type": [
                "string",
                "null"
            ],
            "enum": [
                "foo",
                "bar"
            ]
        },
        "arraySchema": {
            "type": "array",
            "items": {
                "type": "boolean"
            }
        }
    },
    "required": [
        "stringSchema",
        "numberSchema",
        "arraySchema"
    ],
    "additionalProperties": false
}
```
