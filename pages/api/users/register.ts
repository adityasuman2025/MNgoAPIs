import type { NextApiRequest, NextApiResponse } from 'next'
import { md5Hash, encryptText } from 'mngo-project-tools/encryptionUtils';
import { sendRequestToAPI } from "mngo-project-tools/apiUtils";
import { enableCors, send200, send400, send500, getBaseUrl, getEncryptionKey } from '../../../utils';
import { FB_USERS_REF as usersRef } from '../../../constants';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'POST') {
        try {
            const { username, name, email, password, passcode, isAdmin = false } = req.body || {};
            const baseUrl = getBaseUrl();
            const encryptionKey = getEncryptionKey();

            if (!username || !name || !email || !password || !passcode || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const userToken = md5Hash(username + encryptionKey);
            const checkUser = await sendRequestToAPI(
                baseUrl, `/${usersRef}/${userToken}.json`, "GET", {},
                { throwNotOkError: false }
            ) || {};

            if (checkUser && Object.keys(checkUser || {}).length) {
                return send400(res, "username is already taken");
            } else {
                const response = await sendRequestToAPI(
                    baseUrl, `/${usersRef}/${userToken}.json`, "PUT",
                    {
                        userToken,
                        username,
                        name,
                        email,
                        password: encryptText(password, encryptionKey),
                        passcode: encryptText(passcode, encryptionKey),
                        lastActive: new Date().getTime(),
                        addedOn: new Date().getTime(),
                        userChatRooms: {},
                        ...(Boolean(isAdmin) ? { isAdmin: true } : {})
                    },
                    { throwNotOkError: false }
                ) || {};

                if (response.username) return send200(res);
                else return send500(res);
            }
        } catch (e) {
            return send500(res);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);