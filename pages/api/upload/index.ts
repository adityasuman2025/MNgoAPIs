import type { NextApiRequest, NextApiResponse } from 'next';
import multiparty from 'multiparty';
import { sendRequestToAPIWithFormData } from "mngo-project-tools/utils";
import { enableCors, send200, send400, send500, getStorageBaseUrl, convertMultipartyFileToFormData, getFirebaseStorageFileUrl } from '../../../utils';
import { FB_GET_MEDIA_QUERY, FB_UPLOAD_MEDIA_QUERY } from '../../../constants';

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

            if (!fileName || !baseUrl) return send400(res, "missing parameters");

            const form = new multiparty.Form();
            form.parse(req, async function (err: any, fields: any, files: any) {
                try {
                    if (err) return send500(res, 'Error parsing file');

                    const uploadedFile = files.file[0];
                    const formData = convertMultipartyFileToFormData(uploadedFile);
                    if (!uploadedFile || !formData) return send400(res, "missing parameters");

                    const uploadUrl = getFirebaseStorageFileUrl(baseUrl, String(location), String(fileName));

                    const response = await sendRequestToAPIWithFormData(
                        uploadUrl + FB_UPLOAD_MEDIA_QUERY, formData,
                        { throwNotOkError: false }
                    ) || {};

                    if (response.size) {
                        const host = req.headers.host || "";
                        const fileUrl = `https://${host}/api/get-file?location=${String(location)}&fileName=${String(fileName)}`;
                        return send200(res, { fileUrl });
                    }
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