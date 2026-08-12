import { SearchService } from './src/application/services/search-service';
import { PostgresSearchProvider } from './src/infrastructure/providers/postgres-provider';

async function run() {
  const provider = new PostgresSearchProvider();
  const search = new SearchService(provider);

  console.log('--- Health ---');
  const health = await search.health();
  console.log(health);

  console.log('\n--- Indexing a test document ---');
  await search.index({
    entityType: 'patient',
    entityId: '00000000-0000-0000-0000-000000000000',
    title: 'Test Patient ZYX',
    content: 'Phone: 1234567890 Gender: M',
    metadata: { test: true },
  });

  console.log('\n--- Searching for "ZYX" ---');
  const results = await search.search({
    text: 'ZYX',
    types: ['patient'],
    limit: 5,
    sort: 'relevance',
    order: 'desc',
  });
  console.log('Total:', results.total);
  console.log('TookMs:', results.tookMs);
  console.log('Facets:', JSON.stringify(results.facets, null, 2));
  console.log(
    'Results:',
    results.results.map((r) => ({ title: r.title, rank: r.rank, id: r.entityId })),
  );

  console.log('\n--- Cleaning up ---');
  await provider.delete('00000000-0000-0000-0000-000000000000', 'patient');
  console.log('Deleted test document');


}

run().catch(console.error);
