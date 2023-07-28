import React, { useState, useEffect } from 'react';
const { cancelConnection, rejectConnection, acceptConnection } = require('./fetchB2b');

const useCancel = () => {
  const [isBusy, setIsBusy] = useState(false);
  const cancelAction = async (id) => {
    setIsBusy(true);
    await cancelConnection(id);
    setIsBusy(false);
  };
  return [isBusy, cancelAction];
};

const useReject = () => {
  const [isBusy, setIsBusy] = useState(false);
  const rejectAction = async (id) => {
    setIsBusy(true);
    await rejectConnection(id);
    setIsBusy(false);
  };
  return [isBusy, rejectAction];
};

const useAccept = () => {
  const [isBusy, setIsBusy] = useState(false);
  const acceptAction = async (id) => {
    setIsBusy(true);
    await acceptConnection(id);
    setIsBusy(false);
  };
  return [isBusy, acceptAction];
};

export { useCancel, useReject, useAccept };
