import { NextApiResponse } from 'next';

export default async (_, res: NextApiResponse): Promise<any> => {
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();
};
