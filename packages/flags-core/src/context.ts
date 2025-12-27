export interface CompanyContext {
  /**
   * Company key
   */
  key: string;

  /**
   * Company name
   */
  name?: string | undefined;
}

export interface UserContext {
  /**
   * User key
   */
  key: string;

  /**
   * User name
   */
  name?: string | undefined;

  /**
   * User email
   */
  email?: string | undefined;
}

/**
 * Context is a set of key-value pairs.
 * This is used to determine if feature targeting matches and to track events.
 */
export interface FlagsContext {
  company?: CompanyContext;
  user?: UserContext;
}
