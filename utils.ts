import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import {
    FB_API_BASE_URL,
    FB_API_BASE_URL_LC,

    FB_STORAGE_API_BASE_URL,
    FB_STORAGE_API_BASE_URL_DOC,

    ENCRYPTION_KEY,
    ENCRYPTION_KEY_LC,
} from "./constants";

export function enableCors(func: any) {
    /*
        fetch("https://apis.mngo.in/api/users/details?userToken=89d65908212e472339a372bdc2e380e0")
        .then(res => res.json())
        .then(resp => console.log(resp))
    */

    return async function (
        req: NextApiRequest,
        res: NextApiResponse<{ message: string }>
    ) {
        // const origin = req.headers.origin || req.headers.referer || req.headers.host || "";

        // const regex = /https:\/\/[a-z0-9-]+\.mngo\.in/; // /https:\/\/[a-z0-9-]+\.mngo\.in/
        // console.log("enableCors", origin, regex.test(origin), origin.includes("localhost"));
        // if (regex.test(origin) || origin.includes("localhost")) res.setHeader('Access-Control-Allow-Origin', origin);

        res.setHeader('Access-Control-Allow-Origin', "*");
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

export function getStorageBaseUrl(options: { [key: string]: any } = {}) {
    const { isLC = false, isDocument = false } = options || {};

    if (isLC === true) return "lc"
    if (isDocument === true) return FB_STORAGE_API_BASE_URL_DOC;

    return FB_STORAGE_API_BASE_URL;
}

export function getStorageAccessToken(options: { [key: string]: any } = {}) {
    const { isLC = false, isDocument = false } = options || {};

    const token = "token";

    if (isLC === true) return "lc"
    if (isDocument === true) return `&token=${token}`;

    return `&token=${token}`;
}

export function getEncryptionKey(isLC: boolean = false) {
    return isLC ? ENCRYPTION_KEY_LC : ENCRYPTION_KEY;
}

export function convertMultipartyFileToFormData(multipartyFile: any) {
    if (!multipartyFile) return null;

    const type = multipartyFile.headers['content-type'];

    const blob = new Blob([fs.readFileSync(multipartyFile.path)], { type });

    const formData = new FormData();
    formData.append('file', blob);

    return formData;
}

export function getFirebaseStorageFileUrl(baseUrl: string, location: string, fileName: string) {
    const firebaseLocationEndPoint = location ? location.replace(/\//g, "%2F") + "%2F" : "";
    const fileUrl = `${baseUrl}/${firebaseLocationEndPoint}${fileName === "all" ? "" : fileName}`; // if fileName is all then returning all files in the location

    return fileUrl;
}

export function formatDateToDDMMYYYYHHMMLocal(date: Date | string) {
    if (!date) return "";
    if (typeof date === "string") date = new Date(date);

    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = ('0' + date.getMinutes()).slice(-2);

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format

    return `${day}/${month}/${year} ${formattedHours}:${minutes}${ampm}`;
}

export function getSelfBaseUrl(req: NextApiRequest) {
    const host = req.headers.host || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    return baseUrl;
}