import type {
    ArrayObject,
    EnumObject,
    MinimumValidObject,
    ObjectObject,
    PrimitiveObject,
    SchemaObject,
} from '../types.ts';

function isPrimitiveObject(input: unknown): input is PrimitiveObject {
    return (
        typeof input === 'object' &&
        input !== null &&
        'type' in input &&
        (typeof input.type === 'string' ||
            (Array.isArray(input.type) &&
                input.type.length === 2 &&
                input.type[1] === 'null'))
    );
}

function isEnumObject(input: unknown): input is EnumObject {
    return (
        typeof input === 'object' &&
        input !== null &&
        'type' in input &&
        (input.type === 'string' ||
            (Array.isArray(input.type) &&
                input.type.length === 2 &&
                input.type[0] === 'string' &&
                input.type[1] === 'null')) &&
        Array.isArray((input as EnumObject).enum) &&
        (input as EnumObject).enum.every((e) => typeof e === 'string')
    );
}

function isArrayObject(input: unknown): input is ArrayObject {
    return (
        typeof input === 'object' &&
        input !== null &&
        'type' in input &&
        (input.type === 'array' ||
            (Array.isArray(input.type) &&
                input.type.length === 2 &&
                input.type[0] === 'array' &&
                input.type[1] === 'null')) &&
        'items' in input &&
        isSchemaObject((input as ArrayObject).items)
    );
}

function isObjectObject(input: unknown): input is ObjectObject {
    return (
        typeof input === 'object' &&
        input !== null &&
        'type' in input &&
        (input.type === 'object' ||
            (Array.isArray(input.type) &&
                input.type.length === 2 &&
                input.type[0] === 'object' &&
                input.type[1] === 'null')) &&
        'properties' in input &&
        typeof (input as ObjectObject).properties === 'object' &&
        (input as ObjectObject).properties !== null &&
        Object.values((input as ObjectObject).properties).every(
            isSchemaObject,
        ) &&
        'required' in input &&
        Array.isArray((input as ObjectObject).required) &&
        (input as ObjectObject).required.every((r) => typeof r === 'string') &&
        'additionalProperties' in input &&
        typeof (input as ObjectObject).additionalProperties === 'boolean'
    );
}

function isSchemaObject(input: unknown): input is SchemaObject {
    return (
        isPrimitiveObject(input) ||
        isEnumObject(input) ||
        isArrayObject(input) ||
        isObjectObject(input)
    );
}

function isValidTypeObject<T extends MinimumValidObject>(
    input: unknown,
): input is T {
    return (
        typeof input === 'object' &&
        input !== null &&
        'type' in input &&
        (typeof input.type === 'string' ||
            (Array.isArray(input.type) &&
                typeof input.type[0] === 'string' &&
                input.type[1] === 'null'))
    );
}

export const Validator = {
    primitive: isPrimitiveObject,
    enum: isEnumObject,
    array: isArrayObject,
    object: isObjectObject,
    schema: isSchemaObject,
    valid: isValidTypeObject,
};
