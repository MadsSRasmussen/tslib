import { MySQLProvider } from './mysql-provider.ts';
import type { TestDatabase } from '../../utils/test-utils.ts';
import { assertExists } from 'jsr:@std/assert';
import { assertEquals } from 'jsr:@std/assert/equals';

import {
    initializeDatabase,
    TestConnectionConfig,
} from './mysql-provider-test-utils.ts';

Deno.test('mysql-provider can create query', async () => {
    await initializeDatabase();

    const provider = new MySQLProvider<TestDatabase>(TestConnectionConfig);

    const query = provider.query()
        .from('users')
        .select('users.id', 'users.email', ['companies.name', 'company_name'])
        .join('companies', 'companies.id', 'users.company_id')
        .where('users.id', 3)
        .where('companies.name', 'ford-motors');

    assertExists(query);

    const { query: sqlQuery, variables } = provider.build(query);
    const correctSqlQuery =
        'SELECT users.id, users.email, companies.name AS company_name ' +
        'FROM users ' +
        'JOIN companies ON companies.id = users.company_id ' +
        'WHERE users.id = ? AND companies.name = ?;';

    assertEquals(sqlQuery, correctSqlQuery);
    assertEquals(variables, [3, 'ford-motors']);
});

Deno.test('mysql-provider executes query correctly', async () => {
    await initializeDatabase();

    const provider = new MySQLProvider<TestDatabase>(TestConnectionConfig);
    await provider.connect();

    const response = await provider.query()
        .from('users')
        .select('users.id', 'users.email', ['companies.name', 'company_name'])
        .join('companies', 'companies.id', 'users.company_id')
        .where('users.id', 3)
        .where('companies.name', 'ford-motors')
        .execute();
    const correctResponse = [
        {
            id: 3,
            email: 'bob-the-man@outlook.com',
            company_name: 'ford-motors',
        },
    ];

    assertEquals(response, correctResponse);

    await provider.close();
});
