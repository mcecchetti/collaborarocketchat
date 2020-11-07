import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { Utils, WOPI_FILE_MAP } from './Utils';

export class GetCollaboraOnlineFileURL extends ApiEndpoint {
    public path = '/collaboraURL/:fileId/:userId';

    public async get(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        console.log(`GetCollaboraOnlineFileURL: request: ${ JSON.stringify(request) }`);
        console.log(`GetCollaboraOnlineFileURL: endpoint: ${ JSON.stringify(endpoint) }`);

        const fileId = request.params.fileId;
        if (!fileId) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `No file id has been specified`,
            };
        }

        const userId = request.params.userId;
        if (!userId) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `No user id has been specified`,
            };
        }

        const uploadReader = read.getUploadReader();
        const uploadInfo = await uploadReader.getById(fileId);
        if (!uploadInfo) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Upload ${ fileId } could not be found`,
            };
        }

        const reqEncoding = {
            // headers: {
            //     'X-User-Id': userId,
            // },
        };
        const siteSetting = await read.getEnvironmentReader().getServerSettings().getOneById('Site_Url');

        const rid = uploadInfo.room.id;
        const resEncoding = await http.get(`${ siteSetting.value }/api/v1/token.encode/${ rid }/${ userId }/${ fileId }`, reqEncoding);
        if (!resEncoding || !resEncoding.content) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `No valid token has been found`,
            };
        }
        // console.log(`GetCollaboraOnlineFileURL: resEncoding: ${ JSON.stringify(resEncoding) }`);
        // const token = 'test';
        const token = JSON.parse(resEncoding.content).result;
        console.log(`GetCollaboraOnlineFileURL: encoded access token: ${ token }`);

        // console.log(`GetCollaboraOnlineFileURL: baseFileName: ${ uploadInfo.name }`);
        const ext = Utils.getFileExtension(uploadInfo.name);
        if (ext.length === 0) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `No valid extension has been found`,
            };
        }
        // console.log(`GetCollaboraOnlineFileURL: ext: ${ ext }`);

        let WopiFileMapAss = await persis.removeByAssociation(WOPI_FILE_MAP);
        if (!WopiFileMapAss || !WopiFileMapAss[0]) {
            await Utils.updateWopiFileMap(this.app.getID(), read, http);
            WopiFileMapAss = await persis.removeByAssociation(WOPI_FILE_MAP);
            if (!WopiFileMapAss || !WopiFileMapAss[0]) {
                return {
                    status: HttpStatusCode.NOT_FOUND,
                    content: `No valid action has been found`,
                };
            }
        }

        const WopiFileMap = WopiFileMapAss[0];
        await persis.updateByAssociation(WOPI_FILE_MAP, WopiFileMap, true);
        if (!WopiFileMap[ext]) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `No valid action has been found`,
            };
        }
        console.log(`GetCollaboraOnlineFileURL: WOPIFilesMap[${ ext }]: ${ JSON.stringify(WopiFileMap[ext]) }`);

        // const onlineServer = 'http://localhost:9980/loleaflet/fd6b984a3/loleaflet.html?';
        const onlineServer = WopiFileMap[ext].url;

        const response = {
            URL: onlineServer,
            token: token,
        };

        return this.success(response);
    }
}
