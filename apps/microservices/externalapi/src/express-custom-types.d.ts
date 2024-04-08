declare namespace Express {
  interface Request {
    user?: {
      organizationId?: number;
      hasValidEmail?: boolean;
      organization_user_id?: number;
    };
  }
}
