import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { enableCors, send400, send500, getStorageBaseUrl, getFirebaseStorageFileUrl } from '../../../utils';
import { FB_GET_MEDIA_QUERY } from '../../../constants';

export const config = {
    api: { bodyParser: false } // Disable automatic body parsing 
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { location = "", fileName = "", isDocument = false } = req.query || {};
            const baseUrl = getStorageBaseUrl({ isDocument: Boolean(isDocument) });

            if (!fileName || !baseUrl) return send400(res, "missing parameters");

            const fileUrl = getFirebaseStorageFileUrl(baseUrl, String(location), String(fileName)) + FB_GET_MEDIA_QUERY;

            const response = await fetch(fileUrl);

            if (!response.ok) return res.status(response.status).json({ message: `Error opening file: ${response.statusText}` });

            const { headers } = response || {};
            const type: string = headers.get('content-type') || 'text/plain';

            if (response.body) {
                res.setHeader('Content-Type', type);
                response.body.pipe(res);
            } else {
                return send400(res, "Error opening file");
            }
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);