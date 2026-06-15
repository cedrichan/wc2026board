import type { ZodError, ZodIssue } from "zod";

export type EspnSchemaDiagnosticCode =
  | "INVALID_JSON"
  | "INVALID_SCOREBOARD_SCHEMA";

export interface EspnSchemaIssue {
  code: string;
  path: string;
  message: string;
}

export interface EspnSchemaDiagnostic {
  code: EspnSchemaDiagnosticCode;
  message: string;
  issues: EspnSchemaIssue[];
}

export class EspnSchemaValidationError extends Error {
  readonly diagnostic: EspnSchemaDiagnostic;

  constructor(diagnostic: EspnSchemaDiagnostic) {
    super(diagnostic.message);
    this.name = "EspnSchemaValidationError";
    this.diagnostic = diagnostic;
  }
}

export function invalidJsonDiagnostic(): EspnSchemaDiagnostic {
  return {
    code: "INVALID_JSON",
    message: "ESPN response is not valid JSON.",
    issues: [],
  };
}

export function invalidSchemaDiagnostic(error: ZodError): EspnSchemaDiagnostic {
  return {
    code: "INVALID_SCOREBOARD_SCHEMA",
    message: `ESPN scoreboard response failed validation at ${error.issues.length} location(s).`,
    issues: error.issues.map(sanitizeIssue),
  };
}

function sanitizeIssue(issue: ZodIssue): EspnSchemaIssue {
  return {
    code: issue.code,
    path: formatPath(issue.path),
    message: safeIssueMessage(issue),
  };
}

function safeIssueMessage(issue: ZodIssue): string {
  switch (issue.code) {
    case "invalid_type":
      return issue.received === "undefined"
        ? "Required field is missing."
        : "Field has an incompatible type.";
    case "invalid_enum_value":
      return "Field contains an unsupported value.";
    case "invalid_string":
      return "Field contains an invalid string.";
    case "too_small":
      return "Field contains fewer values than required.";
    case "too_big":
      return "Field contains more values than allowed.";
    case "invalid_union":
      return "Field does not match any supported shape.";
    default:
      return "Field failed schema validation.";
  }
}

function formatPath(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "$";
  }

  return path.reduce<string>((result, segment) => {
    if (typeof segment === "number") {
      return `${result}[${segment}]`;
    }
    return result === "$" ? `$.${String(segment)}` : `${result}.${String(segment)}`;
  }, "$");
}
