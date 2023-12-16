import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { enableCors, send200, send400, send500, getStorageBaseUrl, formatDateToDDMMYYYYHHMMLocal } from '../../../utils';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const { appName = "", location } = req.query || {};
            const baseUrl = getStorageBaseUrl();

            if (!appName || !baseUrl || !location) return send400(res, "missing parameters");

            const tempDir = path.join('public/counter');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const combinedFilePath = path.join(tempDir, String(appName + ".txt"));

            let numberOfLines = 0;
            try {
                const oldData = fs.readFileSync(combinedFilePath, 'utf-8') || "";
                numberOfLines = oldData.split('\n').length;
            } catch { }

            let lineToAppend = "";
            if (numberOfLines === 0) {
                const headerLine = "count \t datetime \t location \t user-agent";
                lineToAppend = headerLine + `\n${numberOfLines + 1} \t ${formatDateToDDMMYYYYHHMMLocal(new Date())} \t ${location} \t ${req.headers?.["user-agent"]}`;
            } else {
                lineToAppend = `\n${numberOfLines} \t ${formatDateToDDMMYYYYHHMMLocal(new Date())} \t ${location} \t ${req.headers?.["user-agent"]}`;
            }

            fs.appendFile(combinedFilePath, lineToAppend, (err) => {
                if (err) return send500(res, err.message);

                return send200(res, { message: "counter added for " + appName });
            });
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);