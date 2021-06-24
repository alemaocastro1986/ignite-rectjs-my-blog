import { useUtterances } from '../../hooks/useUtterances';

const commentNodeId = 'comments';

export const Comments = (): JSX.Element => {
  useUtterances(commentNodeId);

  return <div id={commentNodeId} />;
};
