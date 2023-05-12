import httpRequest from '../../utils/httpRequest';

export const signIn = (username, password, rememberMe) => {
  if (rememberMe) {
    window.sessionStorage.setItem('gfwproUserEmail', username);
  }
  const body = {
    username,
    password,
  };

  return httpRequest
    .fetchJSON('/auth/signinpost', body)
    .then((response) => {
      let dialogOpen;
      let dialogTitle;
      let dialogMessage;

      switch (response) {
        case 'RequireNewPassword':
          window.location.href = '/change';
          break;
        case 'ConfirmPassword':
          window.location.href = '/forgot';
          break;
        case 'Authenticated':
          window.location.href = '/verify';
          break;
        case 'ForceReset':
          dialogOpen = true;
          dialogTitle = 'Too many incorrect log in attempts';
          dialogMessage =
            'Your password has expired. Please click “Forgot Password?” to reset your password and log in.';
          break;
        case 'ResetRequired':
          dialogOpen = true;
          dialogTitle = 'Reset Password';
          dialogMessage =
            'Your password has expired. Please click “Forgot Password?” to reset your password and log in.';
          break;
        case 'PasswordExpired':
          dialogOpen = true;
          dialogTitle = 'Reset Password';
          dialogMessage =
            'Your password has expired. Please click “Forgot Password?” to reset your password and log in.';
          break;
        case 'ResendPassword':
          dialogOpen = true;
          dialogTitle = 'Password has expired';
          dialogMessage = 'Please check your email for a new temporary password.';

          break;
        default:
          dialogOpen = true;
          dialogTitle = 'Incorrect username or password entered';
          dialogMessage = 'Click “Forgot Password?” to reset password.';
      }
      return {
        open: dialogOpen,
        title: dialogTitle,
        message: dialogMessage,
      };
    })
    .catch((err) => {
      console.log('Reject', err);
      return {
        open: true,
        title: 'Unable to login',
        message: 'Failed to authenticate user.',
      };
    });
};
