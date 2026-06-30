import { z } from "zod";
import {
  EspnSchemaValidationError,
  invalidJsonDiagnostic,
  invalidSchemaDiagnostic,
} from "./diagnostics";

const identifierSchema = z.string().min(1);
const timestampSchema = z.string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/,
    "Invalid offset timestamp",
  )
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid timestamp");
const optionalTextSchema = z.string().optional();

export const espnImageSchema = z.object({
  href: z.string().min(1),
  width: z.number().nonnegative().optional(),
  height: z.number().nonnegative().optional(),
  alt: z.string().optional(),
  rel: z.array(z.string()).optional(),
});

export const espnTeamSchema = z.object({
  id: identifierSchema.optional(),
  uid: optionalTextSchema,
  slug: optionalTextSchema,
  location: optionalTextSchema,
  name: optionalTextSchema,
  abbreviation: optionalTextSchema,
  displayName: optionalTextSchema,
  shortDisplayName: optionalTextSchema,
  color: optionalTextSchema,
  alternateColor: optionalTextSchema,
  logo: z.string().optional(),
  logos: z.array(espnImageSchema).optional(),
});

export const espnScoreSchema = z.union([
  z.string(),
  z.number(),
  z.object({
    value: z.number().nullable().optional(),
    displayValue: z.string().optional(),
  }),
]);

export const espnCompetitorSchema = z.object({
  id: identifierSchema,
  uid: optionalTextSchema,
  homeAway: z.enum(["home", "away"]).optional(),
  order: z.number().int().optional(),
  winner: z.boolean().optional(),
  advance: z.boolean().optional(),
  score: espnScoreSchema.optional(),
  shootoutScore: z.number().nonnegative().optional(),
  team: espnTeamSchema.optional(),
  linescores: z.array(z.object({
    value: z.number().nullable().optional(),
    displayValue: z.string().optional(),
    period: z.number().int().optional(),
  })).optional(),
});

export const espnStatusSchema = z.object({
  clock: z.number().nonnegative().optional(),
  displayClock: z.string().optional(),
  period: z.number().int().nonnegative().optional(),
  type: z.object({
    id: optionalTextSchema,
    name: optionalTextSchema,
    state: z.string().min(1),
    completed: z.boolean(),
    description: optionalTextSchema,
    detail: optionalTextSchema,
    shortDetail: optionalTextSchema,
  }),
});

export const espnVenueSchema = z.object({
  id: optionalTextSchema,
  fullName: optionalTextSchema,
  address: z.object({
    city: optionalTextSchema,
    state: optionalTextSchema,
    country: optionalTextSchema,
  }).optional(),
});

export const espnDetailSchema = z.object({
  id: optionalTextSchema,
  type: z.object({
    id: optionalTextSchema,
    text: optionalTextSchema,
  }).optional(),
  text: optionalTextSchema,
  clock: z.object({
    value: z.number().nonnegative().optional(),
    displayValue: z.string().optional(),
  }).optional(),
  team: z.object({
    id: identifierSchema.optional(),
  }).optional(),
  participants: z.array(z.object({
    athlete: z.object({
      id: identifierSchema.optional(),
      displayName: optionalTextSchema,
      shortName: optionalTextSchema,
    }).optional(),
  })).optional(),
  athletesInvolved: z.array(z.object({
    id: identifierSchema.optional(),
    displayName: optionalTextSchema,
    shortName: optionalTextSchema,
    team: z.object({
      id: identifierSchema.optional(),
    }).optional(),
  })).optional(),
  scoreValue: z.number().optional(),
  scoringPlay: z.boolean().optional(),
  yellowCard: z.boolean().optional(),
  redCard: z.boolean().optional(),
  penaltyKick: z.boolean().optional(),
  ownGoal: z.boolean().optional(),
  shootout: z.boolean().optional(),
});

export const espnCompetitionSchema = z.object({
  id: identifierSchema,
  uid: optionalTextSchema,
  date: timestampSchema.optional(),
  startDate: timestampSchema.optional(),
  timeValid: z.boolean().optional(),
  altGameNote: optionalTextSchema,
  attendance: z.number().nonnegative().optional(),
  status: espnStatusSchema,
  competitors: z.array(espnCompetitorSchema),
  venue: espnVenueSchema.optional(),
  details: z.array(espnDetailSchema).optional(),
  wasSuspended: z.boolean().optional(),
  playByPlayAvailable: z.boolean().optional(),
});

export const espnEventSchema = z.object({
  id: identifierSchema,
  uid: optionalTextSchema,
  date: timestampSchema,
  name: optionalTextSchema,
  shortName: optionalTextSchema,
  season: z.object({
    year: z.number().int().optional(),
    type: z.union([z.number(), z.string()]).optional(),
    slug: optionalTextSchema,
  }).optional(),
  status: espnStatusSchema.optional(),
  competitions: z.array(espnCompetitionSchema).min(1),
});

export const espnScoreboardSchema = z.object({
  timestamp: timestampSchema.optional(),
  status: z.string().optional(),
  events: z.array(espnEventSchema),
});

export type EspnScoreboard = z.infer<typeof espnScoreboardSchema>;
export type EspnEvent = z.infer<typeof espnEventSchema>;
export type EspnCompetition = z.infer<typeof espnCompetitionSchema>;
export type EspnCompetitor = z.infer<typeof espnCompetitorSchema>;

export function parseEspnScoreboard(payload: unknown): EspnScoreboard {
  const result = espnScoreboardSchema.safeParse(payload);
  if (!result.success) {
    throw new EspnSchemaValidationError(invalidSchemaDiagnostic(result.error));
  }
  return result.data;
}

export function parseEspnScoreboardJson(json: string): EspnScoreboard {
  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new EspnSchemaValidationError(invalidJsonDiagnostic());
  }
  return parseEspnScoreboard(payload);
}
