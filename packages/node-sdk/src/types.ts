
export interface FlagValues {}

export type FlagKey = keyof FlagValues extends never ? string : keyof FlagValues;

export type FlagRule = {
  operator: "ALL" | "SOME" | "NONE";
  userIds?: string[];
  companyIds?: string[];
  rolloutPercentage?: number;
};

export type Flag = {
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean; // default value if no rules match or checked directly
  isArchived: boolean;
  rolledOutToEveryoneAt?: string | null;
  rules?: FlagRule[];
  createdAt: string;
  updatedAt: string;
};

export type RawFlags = Record<string, Flag>;

export type UserContext = {
  key: string;
};

export type CompanyContext = {
  key: string;
};

export type FlagsContext = {
  user: UserContext;
  company: CompanyContext;
};

export type ClientConfig = {
  /**
   * The secret key for the Hauses Flags API (Server-side)
   */
  secretKey: string;

  /**
   * How often to refresh flags in milliseconds
   * @default 60000 (1 minute)
   */
  refreshIntervalMs?: number;

  /**
   * How many evaluations before forcing a background refresh
   * @default 200
   */
  maxEvaluationsBeforeRefresh?: number;

  /**
   * Base URL for the API
   */
  baseUrl?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Default flags to use if fetching fails or before first fetch
   */
  defaultFlags?: RawFlags;
};

export type Events = "user_context" | "check_flag_access";

export type CheckFlagAccessPayload = {
  flagKey: string;
  context: FlagsContext;
};

export type EventPayload<T extends Events> = T extends "user_context"
  ? FlagsContext
  : T extends "check_flag_access"
    ? CheckFlagAccessPayload
    : never;

// --- Internal Types for Evaluation Engine ---

export type FilterClass = {
  type: string;
};

export type FilterGroup<T extends FilterClass> = {
  type: "group";
  operator: "and" | "or";
  filters: FilterTree<T>[];
};

export type FilterNegation<T extends FilterClass> = {
  type: "negation";
  filter: FilterTree<T>;
};

export type FilterTree<T extends FilterClass> =
  | FilterGroup<T>
  | FilterNegation<T>
  | T;

export type ContextFilterOperator =
  | "IS"
  | "IS_NOT"
  | "ANY_OF"
  | "NOT_ANY_OF"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "GT"
  | "LT"
  | "AFTER"
  | "BEFORE"
  | "DATE_AFTER"
  | "DATE_BEFORE"
  | "SET"
  | "NOT_SET"
  | "IS_TRUE"
  | "IS_FALSE";

export interface ContextFilter {
  type: "context";
  field: string;
  operator: ContextFilterOperator;
  values?: string[];
  valueSet?: Set<string>;
}

export type PercentageRolloutFilter = {
  type: "rolloutPercentage";
  key: string;
  partialRolloutAttribute: string;
  partialRolloutThreshold: number;
};

export type ConstantFilter = {
  type: "constant";
  value: boolean;
};

export type RuleFilter = FilterTree<
  ContextFilter | PercentageRolloutFilter | ConstantFilter
>;

export type RuleValue = boolean | string | number | object;

export interface Rule<T extends RuleValue> {
  filter: RuleFilter;
  value: T;
}
