import { Query } from '../../query/query.ts';
import type { Database, FieldData } from '../../query/types.ts';
import type { DatabaseProvider } from '../types.ts';
import {
    type Connection,
    type ConnectionOptions,
    createConnection,
    type FieldPacket,
    type QueryResult,
    type RowDataPacket,
} from 'mysql2/promise';

// TODO: Typescript does not recognize the query method on the base Connection class, why?
type MySQLConnection = Connection & {
    query<T extends QueryResult>(
        sql: string,
        values?: FieldData[],
    ): Promise<[T, FieldPacket[]]>;
    close(): Promise<void>;
};

export class MySQLProvider<T extends Database> implements DatabaseProvider<T> {
    private connection: MySQLConnection | null = null;
    private readonly connectionConfig: ConnectionOptions;

    constructor(config: ConnectionOptions) {
        this.connectionConfig = config;
    }

    query(): Query<T> {
        return new Query(this);
    }

    build<R>(q: Query<T, R>): { query: string; variables: FieldData[] } {
        if (!q.table) throw new Error('No table specified');
        if (q.picks.length < 1) throw new Error('No selections specified');

        const queryBits: string[] = [];
        const variables: FieldData[] = [];

        queryBits.push(
            `SELECT ${
                q.picks.map((p) => Array.isArray(p) ? `${p[0]} AS ${p[1]}` : p)
                    .join(', ')
            }`,
        );
        queryBits.push(`FROM ${String(q.table)}`);

        q.joins.forEach(([table, foreignKey, tableLink, comp]) =>
            queryBits.push(
                `JOIN ${String(table)} ON ${foreignKey} ${comp} ${tableLink}`,
            )
        );

        if (q.wheres.length > 0) {
            const whereClauses: string[] = q.wheres.map(([col, val, comp]) => {
                variables.push(val);
                return `${String(col)} ${comp} ?`;
            });
            queryBits.push(`WHERE ${whereClauses.join(' AND ')}`);
        }

        return {
            query: queryBits.join(' ') + ';',
            variables: variables,
        };
    }

    async execute<R>(q: Query<T, R>): Promise<R[]> {
        if (!this.connection) throw new Error('No connection established');

        const { query, variables } = this.build(q);
        const [rows] = await this.connection.query<RowDataPacket[]>(
            query,
            variables,
        );
        return rows as R[];
    }

    async connect(): Promise<void> {
        this.connection =
            (await createConnection(this.connectionConfig)) as MySQLConnection;
    }

    async close(): Promise<void> {
        if (this.connection) await this.connection.close();
    }
}
