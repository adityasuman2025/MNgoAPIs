import type { NextApiRequest, NextApiResponse } from 'next';
import { sendRequestToAPI } from "mngo-project-tools/apiUtils";
import { enableCors, send200, send400, send500, getBaseUrl, getEncryptionKey } from '../../../utils';
import { FB_USERS_REF as usersRef } from '../../../constants';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { userToken, lc = false } = req.query || {};
            const baseUrl = getBaseUrl(Boolean(lc));
            const encryptionKey = getEncryptionKey(Boolean(lc));

            if (!userToken || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const response = await sendRequestToAPI(
                baseUrl, `/${usersRef}/${userToken}.json`, "GET", {},
                { throwNotOkError: false }
            ) || {};

            if (Object.keys(response).length) {
                const { name, email, username, profileImg } = response || {};
                return send200(res, { name, email, username, profileImg });
            } else {
                return send400(res, "user not found");
            }
        } catch (e) {
            return send500(res);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);