import React, { useState } from 'react';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Dialog from 'material-ui/Dialog';
import Button from '../Button';
import { signIn } from './signIn';
import { nav } from '../../config';
import './LoginForm.scss';

function LoginForm() {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const handleSignIn = () => {
    signIn(username, password, rememberMe).then(({ open, title, message }) => {
      setPassword('');
      setDialogOpen(open);
      setDialogTitle(title);
      setDialogMessage(message);
    });
  };

  const handleKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (showForm) {
          setShowForm(false);
        }
      }}
    >
      <div className="drop-down-nav">
        <button
          className="login-form__display-button"
          type="button"
          data-cy="loginNav"
          onClick={() => setShowForm(!showForm)}
        >
          {nav.login}
        </button>
        <Dialog
          paperClassName="dialog-paper"
          title={dialogTitle}
          actions={[
            <Button
              variant="primary"
              label="OK"
              className="login-ok-button"
              onClick={() => setDialogOpen(false)}
            />,
          ]}
          modal={false}
          open={dialogOpen}
          onRequestClose={() => setDialogOpen(false)}
        >
          <div>{dialogMessage}</div>
        </Dialog>
        <div className={`login-form drop-down-nav__list ${showForm ? 'show' : 'hide'}`}>
          <div className="login-form__title">{nav.login}</div>
          <input
            value={username}
            onKeyPress={handleKeyPress}
            onChange={(evt) => setUsername(evt.target.value)}
            data-cy="username"
            name="username"
            className="login-form__input"
            placeholder={nav.usernameOrEmail}
          />
          <input
            value={password}
            onKeyPress={handleKeyPress}
            type="password"
            onChange={(evt) => setPassword(evt.target.value)}
            data-cy="password"
            name="password"
            className="login-form__input"
            placeholder={nav.password}
          />

          <div>
            <input
              id="remember-me-checkbox"
              checked={rememberMe}
              onChange={(evt) => setRememberMe(evt.target.value)}
              type="checkbox"
            />
            <label htmlFor="remember-me-checkbox">{nav.rememberMe}</label>
          </div>
          <div className="login-form__actions-container">
            <div>
              <a type="button" href="/forgot">
                {nav.forgotPassword}
              </a>
            </div>
            <div>
              <Button
                type="button"
                disabled={!password.length || !username.length}
                data-cy="loginButton"
                variant="primary"
                style={{ width: '100%', backgroundColor: 'transparent' }}
                onClick={handleSignIn}
              >
                {nav.login}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ClickAwayListener>
  );
}

export default LoginForm;
