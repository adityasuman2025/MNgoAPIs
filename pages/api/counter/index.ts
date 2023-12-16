import type { NextApiRequest, NextApiResponse } from 'next';
import { sendRequestToAPIWithFormData } from "mngo-project-tools/utils";
import { enableCors, send200, send400, send500, getStorageBaseUrl, getFirebaseStorageFileUrl, formatDateToDDMMYYYYHHMMLocal } from '../../../utils';
import { FB_GET_MEDIA_QUERY, FB_UPLOAD_MEDIA_QUERY } from '../../../constants';

/*
    we used firebase for stroage because vercel does not support uploading to the local server instead of /tmp folder which is not persistent
    as /tmp folder is cleared after each deployment
*/

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'POST') {
        try {
            const { appName = "", location } = req.body || {};

            const baseUrl = getStorageBaseUrl();

            if (!appName || !location || !baseUrl) return send400(res, "missing parameters");

            const firebaseFileUrl = getFirebaseStorageFileUrl(baseUrl, "counter", String(appName) + ".txt");

            // getting the counter file from firebase storage
            const response: any = await fetch(firebaseFileUrl + FB_GET_MEDIA_QUERY) || {};

            const oldCounterData = response.ok ? await response.text() : "";
            const numberOfLines = oldCounterData.split('\n').length;

            // appending new counter data to the firebase storage file
            const headerLine = "count \t datetime \t location \t user-agent";
            const lineToAppend = (numberOfLines === 1 ? headerLine : "") + `\n${numberOfLines} \t ${formatDateToDDMMYYYYHHMMLocal(new Date())} \t ${location} \t ${req.headers?.["user-agent"]}`;
            const newCounterData = oldCounterData + lineToAppend;

            // uploading the updated counter file to firebase storage
            const blob = new Blob([newCounterData], { type: 'text/plain' });
            const formData = new FormData();
            formData.append('file', blob);

            const uploadResp = await sendRequestToAPIWithFormData(firebaseFileUrl + FB_UPLOAD_MEDIA_QUERY,
                formData, { throwNotOkError: false }
            ) || {};

            if (uploadResp.size) return send200(res);
            else return send500(res, uploadResp?.error?.message);
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else if (req.method === 'GET') {
        try {
            const { appName = "" } = req.query || {};

            const baseUrl = getStorageBaseUrl();

            if (!appName || !baseUrl) return send400(res, "missing parameters");

            const firebaseFileUrl = getFirebaseStorageFileUrl(baseUrl, "counter", String(appName) + ".txt");
            const response: any = await fetch(firebaseFileUrl + FB_GET_MEDIA_QUERY);
            const counterData = response.ok ? await response.text() : "";

            res.setHeader('Content-Type', 'text/plain');
            // @ts-ignore
            res.status(200).send(counterData);
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);