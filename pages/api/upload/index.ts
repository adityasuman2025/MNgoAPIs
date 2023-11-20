import type { NextApiRequest, NextApiResponse } from 'next';
import multiparty from 'multiparty';
import { enableCors, sendRequestToAPIWithFormData, send200, send400, send500, getStorageBaseUrl, convertMultipartyFileToFormData } from '../../../utils';

export const config = {
    api: { bodyParser: false } // Disable automatic body parsing 
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'POST') {
        try {
            const { location = "", fileName } = req.query || {};
            const baseUrl = getStorageBaseUrl();

            if (!location || !fileName || !baseUrl) return send400(res, "missing parameters");

            const form = new multiparty.Form();
            form.parse(req, async function (err: any, fields: any, files: any) {
                try {
                    if (err) return send500(res, 'Error parsing file');

                    const uploadedFile = files.file[0];
                    const formData = convertMultipartyFileToFormData(uploadedFile);
                    if (!uploadedFile || !formData) return send400(res, "missing parameters");

                    const firebaseLocationEndPoint = String(location).replace(/\//g, "%2F");
                    const fileUrl = `${baseUrl}/${firebaseLocationEndPoint}%2F${fileName}`;
                    const response = await sendRequestToAPIWithFormData(fileUrl + "?uploadType=media", formData) || {};

                    if (response.size) return send200(res, { fileUrl: fileUrl + "?alt=media" });
                    else return send500(res, response?.error?.message);
                } catch (e: any) {
                    return send500(res, e.message);
                }
            });
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else if (req.method === 'GET') {
        return send200(res, { message: "upload api" });
    } else {
        return send400(res);
    }
}

export default enableCors(handler);