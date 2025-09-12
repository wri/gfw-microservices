export default function CopyMoveNote({ actionType }) {
  const getNoteMessage = () => {
    if (actionType === 'move') {
      return (
        <>
          <strong>Note</strong>: Both your source list and destination list will go into draft state
          upon saving. Re-submit your source list for analysis to see the most up to date data. You
          may continue to make changes to your destination list and submit for analysis when you're
          ready.
        </>
      );
    } else if (actionType === 'copy') {
      return (
        <>
          <strong>Note</strong>: The structure of your source list will remain unchanged. Your
          destination list will go into draft state upon saving. You may continue to make changes to
          your destination list and submit for analysis when you're ready.
        </>
      );
    }
    return null;
  };

  return (
    <p
      className="save-as-draft__note"
      style={{ margin: '1rem 0', fontWeight: 300, lineHeight: 1.35 }}
    >
      {getNoteMessage()}
    </p>
  );
}
