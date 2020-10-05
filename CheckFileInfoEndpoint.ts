// endpoint.ts
import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';

export class CheckFileInfoEndpoint extends ApiEndpoint {
    public path = 'wopi/files';

    public async get(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        const fileId = 'Sdf9X2gwpZyFrHrNF';
        // const fileId = 'ug2YfQaaKde7nP5pX';

        const uploadReader = read.getUploadReader();
        const uploadInfo = await uploadReader.getById(fileId);
        if (!uploadInfo) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Upload ${ fileId } could not be found`,
            };
        }

        console.log(`CheckFileInfoEndpoint: upload info: ${ JSON.stringify(uploadInfo) }`);

        const wopiFileInfo = {
            BaseFileName: uploadInfo.name,
            Size: uploadInfo.size,
            OwnerId: uploadInfo.user ? uploadInfo.user.id : '',
            UserId:  uploadInfo.user ? uploadInfo.user.id : '',
            UserFriendlyName:        'Marco',
            UserCanWrite:            true,
            UserCanNotWriteRelative: true,
        };

        return this.success(JSON.stringify(wopiFileInfo));
    }
}
