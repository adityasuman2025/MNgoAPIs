import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { enableCors, send400, send500, getStorageBaseUrl, getFirebaseStorageFileUrl, send200 } from '../../../utils';
import { FB_GET_MEDIA_QUERY } from '../../../constants';

export const config = { api: { bodyParser: false } }; // Disable automatic body parsing

function removeDirectoryRecursive(directoryPath: any) {
    console.log("last");

    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const currentPath = path.join(directoryPath, file);

            if (fs.lstatSync(currentPath).isDirectory()) {
                // Recursively remove subdirectories
                removeDirectoryRecursive(currentPath);
            } else {
                // Remove files
                fs.unlinkSync(currentPath);
            }
        });

        // Remove the empty directory
        fs.rmdirSync(directoryPath);
    }
}


async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method === 'GET') {
        try {
            const {
                location = "", fileName = "", isDocument = false, isChunk = false,
                chunkIdx = 0, chunkSize: chunkSizeReq = 3.5 * 1024 * 1024, isLast = false
            } = req.query || {};

            const chunkSize = Number(chunkSizeReq) || 3.5 * 1024 * 1024;
            const baseUrl = getStorageBaseUrl({ isDocument: Boolean(isDocument) });

            if (!fileName || !baseUrl) return send400(res, "missing parameters");

            const fileUrl = getFirebaseStorageFileUrl(baseUrl, String(location), String(fileName)) + FB_GET_MEDIA_QUERY;

            if (Boolean(isChunk) === true) { // streaming in chunks
                // /tmp folder is used to upload the file temporarily in the server
                const tempDir = path.join('/tmp' + `/${String(fileName).split(".")[0]}`); // path.join(__dirname, "/temp" + `/${fileName}`); //
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                if (Number(chunkIdx) === 0) {
                    const response: any = await fetch(fileUrl);

                    if (!response.ok) return res.status(response.status).json({ message: `Error opening file: ${response.statusText}` });

                    const fileData = await response.buffer();
                    const videoString = fileData.toString('base64');

                    const strLength = videoString.length; // length of string is also equals to file size of the text string file
                    const totalChunks = Math.ceil(strLength / chunkSize);
                    for (let i = 0; i < totalChunks; i++) {
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, strLength);

                        const chunkStr = videoString.substring(start, end);
                        const localTextFilePath = path.join(tempDir, `temp_${i}.txt`);
                        fs.writeFileSync(localTextFilePath, chunkStr);
                    }

                    // Read the first text file and returns its content
                    const firstTextFilePath = path.join(tempDir, `temp_0.txt`);
                    const firstTextFileContent = fs.readFileSync(firstTextFilePath, 'utf-8');

                    // if only 1 chunk, i.e it is the last chunk, removing the chunk files folder for local server
                    if (totalChunks === 1) removeDirectoryRecursive(tempDir);

                    return send200(res, { content: firstTextFileContent, totalChunks, type: response?.headers?.get('content-type') });
                } else {
                    // Read the n-th text file and returns its content
                    const firstTextFilePath = path.join(tempDir, `temp_${chunkIdx}.txt`);
                    const firstTextFileContent = fs.readFileSync(firstTextFilePath, 'utf-8');

                    // for last chunk, removing the chunk files folder for local server
                    if (Boolean(isLast) === true) removeDirectoryRecursive(tempDir);

                    return send200(res, { content: firstTextFileContent });
                }
            } else {
                const response: any = await fetch(fileUrl);

                if (!response.ok) return res.status(response.status).json({ message: `Error opening file: ${response.statusText}` });

                const { headers } = response || {};
                if (response.body) {
                    res.setHeader('Content-Type', headers.get('content-type'));
                    res.setHeader('Content-Length', headers.get('content-length')); // content-length header is required to send a long file or a video 
                    res.setHeader('Accept-Ranges', 'bytes');

                    response.body.pipe(res);
                } else {
                    return send400(res, "Error opening file");
                }
            }
        } catch (e: any) {
            return send500(res, e.message);
        }
    } else {
        return send400(res);
    }
}

export default enableCors(handler);


/*
    localhost:3000/api/get-file?location=&fileName=file.mp4&isDocument=true&isChunk=true
    localhost:3000/api/get-file?location=&fileName=peekaboo.mp4&isDocument=true&isChunk=true



    // // Save the video data to a local file
    // const localVideoFilePath = path.join(tempDir, String(fileName));
    // fs.writeFileSync(localVideoFilePath, fileData);
    // // Save the video data to a local file


    // // Save the text data to a local file
    // const localTextFilePath = path.join(tempDir, "text.txt");
    // fs.writeFileSync(localTextFilePath, videoString);
    // Save the text data to a local file



    // const chunkSize = 0.2 * 1024 * 1024
    // const chunk = videoBlob.slice(0, chunkSize)
    // console.log("chunk", chunk)

    // const blobText = await chunk.text()
    // // const base64String = btoa(blobText);

    // const arrayBuffer = await chunk.arrayBuffer();
    // // console.log("arrayBuffer", arrayBuffer)

    // const uint8Array = new Uint8Array(arrayBuffer);

    // // Convert Uint8Array to binary string
    // let binaryString = '';
    // uint8Array.forEach(byte => {
    //     binaryString += String.fromCharCode(byte);
    // });

    // // Convert binary string to Base64
    // const base64String = btoa(binaryString);

    // console.log('Base64 String:', base64String);

    // res.status(200).json({ message: "base64String" });
*/