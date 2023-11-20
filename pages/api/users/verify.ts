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
                    const { name, email, username, profileImg } = response || {};

                    return send200(res, { name, email, username, profileImg });
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

    // if (req.method === 'PUT') {
    //   const Item = {
    //     id: { S: uuid.v4() },
    //     content: { S: req.body.content }
    //   };
    //   await client.send(
    //     new PutItemCommand({
    //       TableName: process.env.TABLE_NAME,
    //       Item,
    //     })
    //   );

    //   return res.status(201).json(Item);
    // }

    // if (req.method === 'POST') {
    //   const { Attributes } = await client.send(
    //     new UpdateItemCommand({
    //       TableName: process.env.TABLE_NAME,
    //       Key: {
    //         id: { S: req.body.id }
    //       },
    //       UpdateExpression: 'set content = :c',
    //       ExpressionAttributeValues: {
    //         ':c': { S: req.body.content }
    //       },
    //       ReturnValues: 'ALL_NEW'
    //     })
    //   );

    //   return res.status(200).json(Attributes);
    // }

    // if (req.method === 'DELETE') {
    //   await client.send(
    //     new DeleteItemCommand({
    //       TableName: process.env.TABLE_NAME,
    //       Key: {
    //         id: { S: req.body.id }
    //       }
    //     })
    //   );

    //   return res.status(204).json({});
    // }
}

export default enableCors(handler);