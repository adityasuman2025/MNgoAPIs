import type { NextApiRequest, NextApiResponse } from 'next'
import { md5Hash, decryptText } from 'mngo-project-tools/encryptionUtil';
import { enableCors, sendRequestToAPI, send200, send400, send401, send500, getBaseUrl, getEncryptionKey } from '../../../utils';
import { FB_USERS_REF as usersRef } from '../../../constants';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { username, password, lc = false } = req.query || {};
            const baseUrl = getBaseUrl(Boolean(lc));
            const encryptionKey = getEncryptionKey(Boolean(lc));

            if (!username || !password || !encryptionKey || !baseUrl) return send400(res);

            const userToken = md5Hash(username + encryptionKey);
            const response = await sendRequestToAPI(baseUrl, `/${usersRef}/${userToken}.json`) || {};

            if (Object.keys(response).length) {
                if (decryptText(response.password, encryptionKey) === password) {
                    const { name, email, username, profileImg, isAdmin } = response || {};

                    if (isAdmin === true) return send200(res, { name, email, username, profileImg });
                    else return send401(res, "not a admin");
                } else {
                    return send401(res, "wrong password");
                }
            } else {
                return send401(res, "username not found");
            }
        } catch (e) {
            return send500(res);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);