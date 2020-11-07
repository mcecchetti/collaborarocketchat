// endpoint.ts
import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { Utils } from './Utils';

export class CheckFileInfoEndpoint extends ApiEndpoint {
    public path = '/wopi/files/:fileId';

    public async get(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        console.log(`CheckFileInfoEndpoint.get: request: ${ JSON.stringify(request) }`);
        const resInfo = await Utils.checkWopiRequest(request, read, http);
        if (resInfo.status !== HttpStatusCode.OK) {
            return resInfo;
        }
        const uploadInfo = resInfo.content.uploadInfo;
        const userInfo = resInfo.content.userInfo;

        const wopiFileInfo = {
            BaseFileName:            uploadInfo.name,
            Size:                    uploadInfo.size,
            OwnerId:                 uploadInfo.user.id,
            UserId:                  userInfo.id,
            UserFriendlyName:        userInfo.name,
            UserCanWrite:            true,
            UserCanNotWriteRelative: true,
        };

        return this.success(JSON.stringify(wopiFileInfo));
    }
}
