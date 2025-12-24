/**
 * User Profile API Service
 * Handles all HTTP requests for user profile operations
 */

import httpRequest from '../../../common/js/utils/httpRequest';
import fetch from '../../../common/js/utils/fetch';

// API Endpoints
const ENDPOINTS = {
  USER_SECRET: '/userSecret',
  ACTIVATE_USER: '/profile/activateUser',
  DEACTIVATE_USER: '/profile/deactivateUser',
  CREATE_USER: '/profile/createuser',
  UPDATE_USER: '/profile/updateuser',
  ADMIN_RESET_PASSWORD: '/auth/admin-reset-user-password',
} as const;

/**
 * Fetches user secret for QR code generation
 */
export const getUserSecret = async (email: string) => {
  const response = await httpRequest.fetchJSON(ENDPOINTS.USER_SECRET, { email });
  return JSON.parse(response);
};

/**
 * Activates a user account
 */
export const activateUser = async (
  userId: number,
  email: string,
  firstName: string,
  lastName: string
) => {
  const response = await httpRequest.fetchJSON(ENDPOINTS.ACTIVATE_USER, {
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName,
  });
  return JSON.parse(response);
};

/**
 * Deactivates a user account
 */
export const deactivateUser = async (userId: number, email: string) => {
  const response = await httpRequest.fetchJSON(ENDPOINTS.DEACTIVATE_USER, {
    name: userId,
    email,
  });
  return JSON.parse(response);
};

/**
 * Creates a new user
 */
export const createUser = async (userData: any) => {
  const headers = { 'Content-Type': 'application/json' };
  return await fetch({
    url: ENDPOINTS.CREATE_USER,
    method: 'POST',
    headers,
    body: userData,
  });
};

/**
 * Updates an existing user
 */
export const updateUser = async (userData: any) => {
  const headers = { 'Content-Type': 'application/json' };
  return await fetch({
    url: ENDPOINTS.UPDATE_USER,
    method: 'POST',
    headers,
    body: userData,
  });
};

/**
 * Admin resets user password
 */
export const adminResetPassword = async (email: string) => {
  const response = await httpRequest.fetchJSON(ENDPOINTS.ADMIN_RESET_PASSWORD, { email });
  return JSON.parse(response);
};
