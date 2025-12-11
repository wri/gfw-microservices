/**
 * Dialog Helper Functions
 * Centralized functions for showing dialog messages
 */

/**
 * Creates dialog state for showing an error message
 */
export const createErrorDialog = (message: string, title = 'Error') => ({
  dialogOpen: true,
  dialogTitle: title,
  dialogMessage: message,
  showModalLoader: false,
});

/**
 * Creates dialog state for showing a success message
 */
export const createSuccessDialog = (message: string, title: string) => ({
  dialogOpen: true,
  dialogTitle: title,
  dialogMessage: message,
  showModalLoader: false,
});

/**
 * Creates dialog state for validation errors
 */
export const createValidationDialog = (errors: string[], missingFields: string[]) => {
  if (errors.length && missingFields.length) {
    errors.unshift('Please review for invalid characters:');
    missingFields.unshift('Please enter:');
    return {
      dialogOpen: true,
      dialogTitle: 'Invalid field entries & Mandatory fields missing',
      dialogMessage: [...errors, ...missingFields],
      updating: false,
    };
  } else if (errors.length) {
    errors.unshift('Please review for invalid characters:');
    return {
      dialogOpen: true,
      dialogTitle: 'Invalid field entries',
      dialogMessage: errors,
      updating: false,
    };
  } else {
    missingFields.unshift('Please enter:');
    return {
      dialogOpen: true,
      dialogTitle: 'Mandatory fields missing',
      dialogMessage: missingFields,
      updating: false,
    };
  }
};

/**
 * Creates dialog state for user activation success
 */
export const createActivationSuccessDialog = (firstName: string, lastName: string) => ({
  dialogOpen: true,
  dialogTitle: 'User activated',
  dialogMessage: `The user ${firstName} ${lastName} has been successfully activated.`,
  showModalLoader: false,
});

/**
 * Creates dialog state for user deactivation success
 */
export const createDeactivationSuccessDialog = (firstName: string, lastName: string) => ({
  dialogOpen: true,
  dialogTitle: 'User deactivated',
  dialogMessage: `The user ${firstName} ${lastName} has been successfully deactivated.`,
  showModalLoader: false,
  updating: false,
});
