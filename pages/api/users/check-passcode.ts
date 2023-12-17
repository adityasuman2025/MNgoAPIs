import type { NextApiRequest, NextApiResponse } from 'next'
import { decryptText } from 'mngo-project-tools/encryptionUtils';
import { sendRequestToAPI } from "mngo-project-tools/apiUtils";
import { enableCors, send200, send400, send500, getBaseUrl, getEncryptionKey } from '../../../utils';
import { FB_USERS_REF as usersRef } from '../../../constants';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { userToken, passcode, lc = false } = req.query || {};
            const baseUrl = getBaseUrl(Boolean(lc));
            const encryptionKey = getEncryptionKey(Boolean(lc));

            if (!userToken || !passcode || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const response = await sendRequestToAPI(
                baseUrl, `/${usersRef}/${userToken}.json`, "GET", {},
                { throwNotOkError: false }
            ) || {};
            if (decryptText(response.passcode, encryptionKey) === passcode) {
                return send200(res);
            } else {
                return send400(res, "wrong pass code");
            }
        } catch (e) {
            return send500(res);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);