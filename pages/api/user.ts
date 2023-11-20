import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
    message: string
}

export default function handler(
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
        res.status(200).json({ message: 'Hello from Next.js!' })
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