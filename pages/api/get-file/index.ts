import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { enableCors, send400, send500, getStorageBaseUrl, getFirebaseStorageFileUrl } from '../../../utils';

export const config = {
    api: { bodyParser: false } // Disable automatic body parsing 
};

// https://firebasestorage.googleapis.com/v0/b/mngo-aditya.appspot.com/o/quiz%2Fquiz.json?alt=media&token=be695454-dd18-4948-8681-a064c2c9d8b5
// http://localhost:3000/api/get-file?location=quiz&fileName=quiz.json
// https://apis.mngo.in/api/get-file?location=quiz&fileName=quiz.json

// https://firebasestorage.googleapis.com/v0/b/documents-b4b54.appspot.com/o/aditya_suman_sde2_iitp.pdf?alt=media
// http://localhost:3000/api/get-file?location=&fileName=aditya_suman_sde2_iitp.pdf&isDocument=true

// https://firebasestorage.googleapis.com/v0/b/documents-b4b54.appspot.com/o/Achievement%2FLOR%20-%20Dr.%20Mayank%20Agrawal.pdf?alt=media
// http://localhost:3000/api/get-file?location=Achievement&fileName=LOR - Dr. Mayank Agrawal.pdf&isDocument=true
// https://apis.mngo.in/api/get-file?location=Achievement&fileName=LOR - Dr. Mayank Agrawal.pdf&isDocument=true

// https://firebasestorage.googleapis.com/v0/b/documents-b4b54.appspot.com/o
// http://localhost:3000/api/get-file?location=&fileName=all&isDocument=true
// https://apis.mngo.in/api/get-file?location=&fileName=all&isDocument=true

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { location = "", fileName = "", isDocument = false } = req.query || {};
            const baseUrl = getStorageBaseUrl({ isDocument: Boolean(isDocument) });

            if (!fileName || !baseUrl) return send400(res, "missing parameters");

            const fileUrl = getFirebaseStorageFileUrl(baseUrl, String(location), String(fileName));

            const response = await fetch(fileUrl + "?alt=media");

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