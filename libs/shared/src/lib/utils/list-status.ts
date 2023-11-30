const StatusMapping: { [key: number]: string } = {
  1: 'Pending',
  2: 'Completed',
  3: 'Error',
  4: 'Draft',
  5: 'Analyzing Diagnostic',
  6: 'Analyzing Dashboard',
};

export function getListStatusString(status: number): string {
  return StatusMapping[status] || 'Invalid Status';
}
