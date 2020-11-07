// endpoint.ts
import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { Buffer} from 'buffer';

import { Utils } from './Utils';

export class GetFileEndpoint extends ApiEndpoint {
    public path = '/wopi/files/:fileId/contents';

    public async get(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        console.log(`GetFileEndpoint.get: request: ${ JSON.stringify(request) }`);
        const res = await Utils.checkWopiRequest(request, read, http);
        if (res.status !== HttpStatusCode.OK) {
            return res;
        }

        const fileId = request.params.fileId;
        const uploadReader = read.getUploadReader();
        const fileBuffer = await uploadReader.getBufferById(fileId);
        if (!fileBuffer) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Upload ${ fileId } could not be found`,
            };
        }
        // console.log(`GetFileEndpoint.get: ${ fileBuffer. }`)
        return this.success(fileBuffer);
    }

    public async post(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {

        console.log(`GetFileEndpoint.post: request: ${ JSON.stringify(request) }`);
        const res = await Utils.checkWopiRequest(request, read, http);
        if (res.status !== HttpStatusCode.OK) {
            return res;
        }

        const content = request.content;
        if (!content) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Content could not be found`,
            };
        }

        const blob = Buffer.from(content);

        console.log(`GetFileEndpoint: post: ${ JSON.stringify(blob) }`);
        return this.success('');
    }
}
