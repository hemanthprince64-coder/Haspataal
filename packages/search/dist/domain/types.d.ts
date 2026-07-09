import { z } from 'zod';

export declare const EntityType: z.ZodEnum<
  [
    'patient',
    'doctor',
    'hospital',
    'appointment',
    'journey',
    'prescription',
    'lab',
    'radiology',
    'bill',
    'medicine',
    'investigation',
    'notification',
    'task',
    'clinical',
    'timeline',
  ]
>;
export type EntityType = z.infer<typeof EntityType>;
export declare const SearchQuery: z.ZodObject<
  {
    text: z.ZodString;
    types: z.ZodOptional<
      z.ZodArray<
        z.ZodEnum<
          [
            'patient',
            'doctor',
            'hospital',
            'appointment',
            'journey',
            'prescription',
            'lab',
            'radiology',
            'bill',
            'medicine',
            'investigation',
            'notification',
            'task',
            'clinical',
            'timeline',
          ]
        >,
        'many'
      >
    >;
    hospitalId: z.ZodOptional<z.ZodString>;
    dateRange: z.ZodOptional<
      z.ZodObject<
        {
          from: z.ZodOptional<z.ZodDate>;
          to: z.ZodOptional<z.ZodDate>;
        },
        'strip',
        z.ZodTypeAny,
        {
          from?: Date | undefined;
          to?: Date | undefined;
        },
        {
          from?: Date | undefined;
          to?: Date | undefined;
        }
      >
    >;
    status: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<['relevance', 'created_at', 'updated_at']>>;
    order: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    sort: 'relevance' | 'created_at' | 'updated_at';
    text: string;
    limit: number;
    order: 'asc' | 'desc';
    hospitalId?: string | undefined;
    status?: string | undefined;
    types?:
      | (
          | 'patient'
          | 'doctor'
          | 'hospital'
          | 'appointment'
          | 'journey'
          | 'prescription'
          | 'lab'
          | 'radiology'
          | 'bill'
          | 'medicine'
          | 'investigation'
          | 'notification'
          | 'task'
          | 'clinical'
          | 'timeline'
        )[]
      | undefined;
    dateRange?:
      | {
          from?: Date | undefined;
          to?: Date | undefined;
        }
      | undefined;
    cursor?: string | undefined;
  },
  {
    text: string;
    hospitalId?: string | undefined;
    sort?: 'relevance' | 'created_at' | 'updated_at' | undefined;
    status?: string | undefined;
    types?:
      | (
          | 'patient'
          | 'doctor'
          | 'hospital'
          | 'appointment'
          | 'journey'
          | 'prescription'
          | 'lab'
          | 'radiology'
          | 'bill'
          | 'medicine'
          | 'investigation'
          | 'notification'
          | 'task'
          | 'clinical'
          | 'timeline'
        )[]
      | undefined;
    dateRange?:
      | {
          from?: Date | undefined;
          to?: Date | undefined;
        }
      | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
    order?: 'asc' | 'desc' | undefined;
  }
>;
export type SearchQuery = z.input<typeof SearchQuery>;
export declare const SearchResult: z.ZodObject<
  {
    id: z.ZodString;
    entityType: z.ZodEnum<
      [
        'patient',
        'doctor',
        'hospital',
        'appointment',
        'journey',
        'prescription',
        'lab',
        'radiology',
        'bill',
        'medicine',
        'investigation',
        'notification',
        'task',
        'clinical',
        'timeline',
      ]
    >;
    entityId: z.ZodString;
    hospitalId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    rank: z.ZodNumber;
    highlight: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, 'many'>>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    entityType:
      | 'patient'
      | 'doctor'
      | 'hospital'
      | 'appointment'
      | 'journey'
      | 'prescription'
      | 'lab'
      | 'radiology'
      | 'bill'
      | 'medicine'
      | 'investigation'
      | 'notification'
      | 'task'
      | 'clinical'
      | 'timeline';
    entityId: string;
    title: string;
    id: string;
    rank: number;
    createdAt: Date;
    updatedAt: Date;
    hospitalId?: string | undefined;
    content?: string | undefined;
    metadata?: Record<string, any> | undefined;
    highlight?: Record<string, string[]> | undefined;
  },
  {
    entityType:
      | 'patient'
      | 'doctor'
      | 'hospital'
      | 'appointment'
      | 'journey'
      | 'prescription'
      | 'lab'
      | 'radiology'
      | 'bill'
      | 'medicine'
      | 'investigation'
      | 'notification'
      | 'task'
      | 'clinical'
      | 'timeline';
    entityId: string;
    title: string;
    id: string;
    rank: number;
    createdAt: Date;
    updatedAt: Date;
    hospitalId?: string | undefined;
    content?: string | undefined;
    metadata?: Record<string, any> | undefined;
    highlight?: Record<string, string[]> | undefined;
  }
>;
export type SearchResult = z.infer<typeof SearchResult>;
export declare const SearchResponse: z.ZodObject<
  {
    results: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          entityType: z.ZodEnum<
            [
              'patient',
              'doctor',
              'hospital',
              'appointment',
              'journey',
              'prescription',
              'lab',
              'radiology',
              'bill',
              'medicine',
              'investigation',
              'notification',
              'task',
              'clinical',
              'timeline',
            ]
          >;
          entityId: z.ZodString;
          hospitalId: z.ZodOptional<z.ZodString>;
          title: z.ZodString;
          content: z.ZodOptional<z.ZodString>;
          metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
          rank: z.ZodNumber;
          highlight: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, 'many'>>>;
          createdAt: z.ZodDate;
          updatedAt: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          entityType:
            | 'patient'
            | 'doctor'
            | 'hospital'
            | 'appointment'
            | 'journey'
            | 'prescription'
            | 'lab'
            | 'radiology'
            | 'bill'
            | 'medicine'
            | 'investigation'
            | 'notification'
            | 'task'
            | 'clinical'
            | 'timeline';
          entityId: string;
          title: string;
          id: string;
          rank: number;
          createdAt: Date;
          updatedAt: Date;
          hospitalId?: string | undefined;
          content?: string | undefined;
          metadata?: Record<string, any> | undefined;
          highlight?: Record<string, string[]> | undefined;
        },
        {
          entityType:
            | 'patient'
            | 'doctor'
            | 'hospital'
            | 'appointment'
            | 'journey'
            | 'prescription'
            | 'lab'
            | 'radiology'
            | 'bill'
            | 'medicine'
            | 'investigation'
            | 'notification'
            | 'task'
            | 'clinical'
            | 'timeline';
          entityId: string;
          title: string;
          id: string;
          rank: number;
          createdAt: Date;
          updatedAt: Date;
          hospitalId?: string | undefined;
          content?: string | undefined;
          metadata?: Record<string, any> | undefined;
          highlight?: Record<string, string[]> | undefined;
        }
      >,
      'many'
    >;
    total: z.ZodNumber;
    nextCursor: z.ZodOptional<z.ZodString>;
    tookMs: z.ZodNumber;
    facets: z.ZodOptional<
      z.ZodRecord<
        z.ZodString,
        z.ZodArray<
          z.ZodObject<
            {
              value: z.ZodString;
              count: z.ZodNumber;
            },
            'strip',
            z.ZodTypeAny,
            {
              value: string;
              count: number;
            },
            {
              value: string;
              count: number;
            }
          >,
          'many'
        >
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    results: {
      entityType:
        | 'patient'
        | 'doctor'
        | 'hospital'
        | 'appointment'
        | 'journey'
        | 'prescription'
        | 'lab'
        | 'radiology'
        | 'bill'
        | 'medicine'
        | 'investigation'
        | 'notification'
        | 'task'
        | 'clinical'
        | 'timeline';
      entityId: string;
      title: string;
      id: string;
      rank: number;
      createdAt: Date;
      updatedAt: Date;
      hospitalId?: string | undefined;
      content?: string | undefined;
      metadata?: Record<string, any> | undefined;
      highlight?: Record<string, string[]> | undefined;
    }[];
    total: number;
    tookMs: number;
    nextCursor?: string | undefined;
    facets?:
      | Record<
          string,
          {
            value: string;
            count: number;
          }[]
        >
      | undefined;
  },
  {
    results: {
      entityType:
        | 'patient'
        | 'doctor'
        | 'hospital'
        | 'appointment'
        | 'journey'
        | 'prescription'
        | 'lab'
        | 'radiology'
        | 'bill'
        | 'medicine'
        | 'investigation'
        | 'notification'
        | 'task'
        | 'clinical'
        | 'timeline';
      entityId: string;
      title: string;
      id: string;
      rank: number;
      createdAt: Date;
      updatedAt: Date;
      hospitalId?: string | undefined;
      content?: string | undefined;
      metadata?: Record<string, any> | undefined;
      highlight?: Record<string, string[]> | undefined;
    }[];
    total: number;
    tookMs: number;
    nextCursor?: string | undefined;
    facets?:
      | Record<
          string,
          {
            value: string;
            count: number;
          }[]
        >
      | undefined;
  }
>;
export type SearchResponse = z.infer<typeof SearchResponse>;
//# sourceMappingURL=types.d.ts.map
