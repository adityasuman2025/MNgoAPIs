import type { NextApiRequest, NextApiResponse } from 'next';
import { md5Hash, decryptText, encryptText } from 'mngo-project-tools/encryptionUtil';
import { sendRequestToAPI } from "mngo-project-tools/utils";
import { enableCors, send200, send400, send500, getBaseUrl, getEncryptionKey } from '../../../utils';
import { FB_USER_NOTES_REF as usersNotesRef } from '../../../constants';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string }>
) {
    const baseUrl = getBaseUrl();
    const encryptionKey = getEncryptionKey();

    try {
        if (req.method === 'GET') { // getUserNotes
            const { userToken } = req.query || {};

            if (!userToken || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const userNotesToken = md5Hash(userToken + "_notes_" + encryptionKey);
            const response: { [key: string]: any } = await sendRequestToAPI(
                baseUrl, `/${usersNotesRef}/${userNotesToken}.json`, "GET", {},
                { throwNotOkError: false }
            ) || {};

            const data: { [key: string]: any } = {
                notesList: Object.values(response)
                    .reduce((acc, item) => [...acc, {
                        ...item,
                        title: decryptText(item.title, encryptionKey),
                        noteContentItems: (item.noteContentItems || []).map((i: any) => ({ ...i, text: decryptText(i.text, encryptionKey) }))
                    }], [])
                    .sort((a: any, b: any) => b.ts - a.ts) // for sorting by timestamps(ts)
            };

            return send200(res, data);
        } else if (req.method === 'POST') { // createUserNote
            const { userToken } = req.query || {};

            const userNoteId = md5Hash(userToken + "_note_" + (new Date().getTime()) + "_" + encryptionKey);

            if (!userToken || !userNoteId || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const userNotesToken = md5Hash(userToken + "_notes_" + encryptionKey);
            await sendRequestToAPI(
                baseUrl, `/${usersNotesRef}/${userNotesToken}/${userNoteId}.json`, "PUT",
                {
                    title: "", type: 1, id: userNoteId,
                    ts: new Date().getTime(),
                    noteContentItems: [{ text: "" }]
                },
                { throwNotOkError: false }
            );

            return send200(res, { userNoteId });
        } else if (req.method === 'PUT') { // updateUserNote
            const { userToken, userNoteId } = req.query || {};
            const { noteDetails } = req.body || {};

            if (!userToken || !userNoteId || !noteDetails || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const { title = "", noteContentItems = [] } = noteDetails || {};
            const userNotesToken = md5Hash(userToken + "_notes_" + encryptionKey);

            await sendRequestToAPI(
                baseUrl, `/${usersNotesRef}/${userNotesToken}/${userNoteId}.json`, "PUT",
                {
                    ...noteDetails,
                    id: userNoteId,
                    title: encryptText(title, encryptionKey),
                    noteContentItems: noteContentItems.map((item: any, idx: number) => ({
                        ...item, id: userNoteId + "_content_" + idx,
                        text: encryptText(item.text, encryptionKey),
                    }))
                },
                { throwNotOkError: false }
            );

            return send200(res, { userNoteId });
        } else if (req.method === 'DELETE') { // deleteUserNote
            const { userToken, userNoteId } = req.query || {};

            if (!userToken || !userNoteId || !encryptionKey || !baseUrl) return send400(res, "missing parameters");

            const userNotesToken = md5Hash(userToken + "_notes_" + encryptionKey);
            await sendRequestToAPI(
                baseUrl, `/${usersNotesRef}/${userNotesToken}/${userNoteId}.json`, "DELETE", {},
                { throwNotOkError: false }
            );

            return send200(res);
        } else {
            return send400(res);
        }
    } catch (e) {
        return send500(res);
    }
}

export default enableCors(handler);