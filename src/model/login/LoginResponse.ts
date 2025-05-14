export interface LoginResponse {
    sessionId: string;
    authenticated: boolean;
    user: {
      uuid: string;
      display: string;
      username: string;
      systemId: string;
      userProperties: Record<string, string>;
      person: { uuid: string };
      privileges: Array<{ uuid: string; name: string }>;
      roles: Array<{ uuid: string; name: string }>;
    };
    locale: string;
    allowedLocales: string[];
    sessionLocation?: string | null;
  }
  