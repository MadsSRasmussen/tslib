import {
    type Connection,
    type ConnectionOptions,
    createConnection,
    type FieldPacket,
    type QueryResult,
} from 'mysql2/promise';
import type { FieldData } from '../../query/types.ts';

export const TestConnectionConfig: ConnectionOptions = {
    host: '127.0.0.1',
    port: 3306,
    password: 'root',
    database: 'test',
    user: 'root',
};

type MySQLConnection = Connection & {
    query<T extends QueryResult>(
        sql: string,
        values?: FieldData[],
    ): Promise<[T, FieldPacket[]]>;
    close(): Promise<void>;
};

export async function initializeDatabase(): Promise<void> {
    const connection =
        (await createConnection(TestConnectionConfig)) as MySQLConnection;

    const metaUrl = import.meta.url;
    const metaFolderUrl = metaUrl.slice(0, metaUrl.lastIndexOf('/')) + '/';
    const [_, actualUrl] = metaFolderUrl.split('file:');

    const sqlContents = await Deno.readTextFile(actualUrl + 'setup.sql');
    const sqlStatements = sqlContents
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

    for (const statement of sqlStatements) {
        await connection.query(statement);
    }
    await connection.close();
}
