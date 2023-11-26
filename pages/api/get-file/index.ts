import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import rangeParser from 'range-parser';
import { enableCors, send400, send500, getStorageBaseUrl, getFirebaseStorageFileUrl } from '../../../utils';
import { FB_GET_MEDIA_QUERY } from '../../../constants';

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false
    }
}; // Disable automatic body parsing

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { location = "", fileName = "", isDocument = false, isChunk = false } = req.query || {};
            const baseUrl = getStorageBaseUrl({ isDocument: Boolean(isDocument) });

            if (!fileName || !baseUrl) return send400(res, "missing parameters");

            const fileUrl = getFirebaseStorageFileUrl(baseUrl, String(location), String(fileName)) + FB_GET_MEDIA_QUERY;

            const response: any = await fetch(fileUrl);

            if (!response.ok) return res.status(response.status).json({ message: `Error opening file: ${response.statusText}` });

            const { headers } = response || {};
            const type: string = headers.get('content-type') || 'text/plain';
            const length: string = headers.get('content-length') || "1";

            if (Boolean(isChunk) === true) { // streaming in chunks
                // Parse the range header
                const range = req.headers.range || 'bytes=0-';
                const ranges = rangeParser(response.headers.get('content-length'), range);

                if (!ranges) {
                    return res.status(416).end(); // Range Not Satisfiable
                }

                const chunkSize = 3 * 1024 * 1024; // 1MB

                // Set the appropriate Content-Range header
                let start = 1 //ranges[0].start;
                const end = response.headers.get('content-length'); // Math.min(start + chunkSize - 1, response.headers.get('content-length') - 1);

                while (start <= end) {
                    const chunkEnd = Math.min(start + chunkSize, end);
                    console.log("start, end", start, chunkEnd)

                    const chunkResponse = await fetch(fileUrl, {
                        headers: { Range: `bytes=${start}-${chunkEnd}` },
                    });
                    const chunkBuffer = await chunkResponse.buffer();
                    // console.log("chunkBuffer", chunkBuffer)

                    res.setHeader('Content-Range', `bytes ${start}-${chunkEnd}/${end}`);
                    res.setHeader('Accept-Ranges', 'bytes');
                    res.setHeader('Content-Length', chunkEnd - start);
                    res.status(206); // Partial Content

                    res.write(chunkBuffer);
                    start += chunkSize;
                }

                res.end();
            } else {
                if (response.body) {
                    res.setHeader('Content-Type', type);
                    res.setHeader('Content-Length', length); // content-length header is required to send a long file or a video 
                    res.setHeader('Accept-Ranges', 'bytes');

                    response.body.pipe(res);
                } else {
                    return send400(res, "Error opening file");
                }
            }
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);