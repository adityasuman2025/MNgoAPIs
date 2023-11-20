import type { NextApiRequest, NextApiResponse } from 'next'

/*

fetch("https://apis.mngo.in/api/user")
.then(resp => resp.json())
.then(json => console.log(json))

fetch("http://localhost:3000/api/user")
.then(resp => resp.json())
.then(json => console.log(json))

*/

const enableCors = (fn: any) => async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) => {
    const origin = req.headers.host || "";
    const regex = /[a-z0-9-]+\.mngo\.in/; // /[a-z0-9-]+\.mngo\.in/

    if (regex.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', "true")
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // specific logic for the preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    return await fn(req, res)
}

type ResponseData = {
    message: string
}

function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
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

    if (req.method === 'GET') {
        res.status(200).json({ message: req.headers.host || "" })
    }

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