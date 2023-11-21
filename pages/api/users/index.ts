import type { NextApiRequest, NextApiResponse } from 'next';
import { enableCors, send200, send400 } from '../../../utils';

export const config = {
    api: { bodyParser: false } // Disable automatic body parsing 
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        return send200(res, { message: "users api" });
    } else {
        return send400(res);
    }
}

export default enableCors(handler);