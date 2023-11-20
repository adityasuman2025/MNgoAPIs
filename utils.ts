import type { NextApiRequest, NextApiResponse } from 'next';
import {
    FB_API_BASE_URL,
    FB_API_BASE_URL_LC,
    ENCRYPTION_KEY,
    ENCRYPTION_KEY_LC,
} from "./constants";

export function enableCors(func: any) {
    return async function (
        req: NextApiRequest,
        res: NextApiResponse<{ message: string }>
    ) {
        const origin = req.headers.origin || req.headers.referer || req.headers.host || "";

        const regex = /https:\/\/[a-z0-9-]+\.mngo\.in/; // /https:\/\/[a-z0-9-]+\.mngo\.in/

        console.log("enableCors", origin, regex.test(origin), origin.includes("localhost"));
        if (regex.test(origin) || origin.includes("localhost")) res.setHeader('Access-Control-Allow-Origin', origin);

        res.setHeader('Access-Control-Allow-Credentials', "true")
        res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )

        if (req.method === 'OPTIONS') { // specific logic for the preflight request
            res.status(200).end()
            return
        }

        return await func(req, res);
    }
}

export async function sendRequestToAPI(baseUrl: string, endpoint: string, method: string = "get", body?: { [key: string]: any }) {
    const requestAddress = baseUrl + endpoint;
    const response = await fetch(requestAddress, {
        method,
        ...(method.toLowerCase() === "get" ? {} : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        })
    });
    return await response.json();
}

export function send200(res: NextApiResponse, data: { [key: string]: any } = {}) { // success
    return res.status(200).json({ message: "success", data });
}

export function send400(res: NextApiResponse, message: string = "bad request") { // bad request
    return res.status(400).json({ message });
}

export function send401(res: NextApiResponse, message: string = "unauthorized") { // unauthorized
    return res.status(401).json({ message });
}

export function send500(res: NextApiResponse, message: string = "something went wrong") { // internal server error
    return res.status(500).json({ message });
}

export function getBaseUrl(isLC: boolean = false) {
    return isLC ? FB_API_BASE_URL_LC : FB_API_BASE_URL;
}

export function getEncryptionKey(isLC: boolean = false) {
    return isLC ? ENCRYPTION_KEY_LC : ENCRYPTION_KEY;
}