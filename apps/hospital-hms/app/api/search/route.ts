import { SearchService } from '@haspataal/search';

import { NextResponse } from 'next/server';

import { PostgresSearchProvider } from './providers/postgres-provider';

const provider = new PostgresSearchProvider();
const searchService = new SearchService(provider);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const types = searchParams.get('types')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '20');

    const results = await searchService.search({ text: query, types, limit });
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
