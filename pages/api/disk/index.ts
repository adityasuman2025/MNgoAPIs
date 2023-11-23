import type { NextApiRequest, NextApiResponse } from 'next';
import { sendRequestToAPI } from "mngo-project-tools/utils";
import { enableCors, send200, send400, send500, getStorageBaseUrl, getFirebaseStorageFileUrl } from '../../../utils';
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
            const baseUrl = getStorageBaseUrl({ isDocument: true });
            const fileName = "all", location = "";

            if (!fileName || !baseUrl) return send400(res, "missing parameters");

            const fileUrl = getFirebaseStorageFileUrl(baseUrl, String(location), String(fileName)) + FB_GET_MEDIA_QUERY;

            const response = await sendRequestToAPI(
                fileUrl, "", "GET", {},
                { throwNotOkError: false }
            ) || {};

            if (Object.keys(response).length) {
                if (response.items) {
                    const data = response.items.map(({ name }: any) => name);
                    return send200(res, data);
                } else {
                    return send500(res, response.error.message);
                }
            } else {
                return send400(res, "file not found");
            }
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);