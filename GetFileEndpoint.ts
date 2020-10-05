// endpoint.ts
import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';

export class GetFileEndpoint extends ApiEndpoint {
    public path = 'wopi/files/contents';

    public async get(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        const fileId = 'Sdf9X2gwpZyFrHrNF';
        // const fileId = 'ug2YfQaaKde7nP5pX';

        const uploadReader = read.getUploadReader();
        const fileBuffer = await uploadReader.getBufferById(fileId);
        if (!fileBuffer) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Upload ${ fileId } could not be found`,
            };
        }

        return this.success(fileBuffer.toString('ascii'));
    }

    public async post(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        const content = request.content;
        if (!content) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Content could not be found`,
            };
        }

        console.log(`GetFileEndpoint: ${ JSON.stringify(request) }`);
        return this.success('');
    }

}