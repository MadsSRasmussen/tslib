import type { Schema } from '../../mod.ts';

export interface SchemaSerializer {
    serializable(data: Schema): object;
    serialize(data: Schema): string;
    deserialize(serializedData: string): Schema;
}
