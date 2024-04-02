declare namespace Express {
  interface Request {
    user?: {
      organizationId?: number;
      hasValidEmail?: boolean;
    };
  }
}
