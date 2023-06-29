export const getUserInternalShareLists = `SELECT * FROM InternalShareRoutes
WHERE
  admin_id = @user_id or
  user_id = @user_id`;
