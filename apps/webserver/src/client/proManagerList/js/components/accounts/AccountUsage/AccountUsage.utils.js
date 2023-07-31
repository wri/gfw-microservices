export const getOneMonthAgoDate = () => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  return oneMonthAgo.toISOString().split('T')[0];
};

// Function to get today's date in the format yyyy-mm-dd
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayString = new Date().toISOString().slice(0, 10);
