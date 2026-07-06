import { SearchQueryHandler, SeedCommandHandler, SearchService, PostgresSearchProvider } from '@haspataal/search';
// PRISMA NO LONGER INJECTED
import { NextResponse } from 'next/server';
import { requireHospital } from '../../../lib/auth/middleware';
import { createPlatformQueryContext } from '../../../lib/platform';
import { v4 as uuidv4 } from 'uuid';

const provider = new PostgresSearchProvider();
const searchService = new SearchService(provider);
const queryHandler = new SearchQueryHandler(searchService);
const seedHandler = new SeedCommandHandler(searchService);

export async function GET(req: Request) {
  try {
    const auth = await requireHospital(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = auth.user!.hospital_id;
    platformContext.actorScope.actorId = auth.user!.user_id;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const action = searchParams.get('action') || 'search';
    const limit = parseInt(searchParams.get('limit') || '20');
    const types = searchParams.get('types')?.split(',') || undefined;

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    if (action === 'autocomplete') {
      const platformQuery = {
        ...platformContext,
        filters: { query, types, limit },
      };
      const results = await queryHandler.handleAutocomplete(platformQuery as any);
      return NextResponse.json({ suggestions: results.suggestions, tookMs: results.tookMs });
    }

    const cursor = searchParams.get('cursor') || undefined;
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    const platformQuery = {
      ...platformContext,
      filters: { query, types, limit, cursor, from, to },
    };

    const results = await queryHandler.handleSearch(platformQuery as any);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireHospital(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();

    const platformContext = await createPlatformQueryContext(req);
    platformContext.tenantScope.hospitalId = auth.user!.hospital_id;
    platformContext.actorScope.actorId = auth.user!.user_id;

    const command = {
      commandId: uuidv4(),
      target: 'search',
      tenantContext: platformContext.tenantScope,
      payload: body,
    };

    const result = await seedHandler.handleSeedCommand(command as any);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
