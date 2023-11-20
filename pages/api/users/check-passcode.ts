import type { NextApiRequest, NextApiResponse } from 'next'
import { decryptText } from 'mngo-project-tools/encryptionUtil';
import { enableCors, sendRequestToAPI, send200, send400, send500, getBaseUrl, getEncryptionKey } from '../../../utils';
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

            if (!userToken || !passcode || !encryptionKey || !baseUrl) return send400(res);

            const response = await sendRequestToAPI(baseUrl, `/${usersRef}/${userToken}.json`) || {};
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