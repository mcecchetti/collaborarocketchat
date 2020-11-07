import { HttpStatusCode, IHttp, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';

export class Utils {
    public static async checkWopiRequest(request: IApiRequest, read: IRead, http: IHttp): Promise<IApiResponse> {

        const token = request.query.access_token;
        if (!token) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: `No access token has been found`,
            };
        }

        const siteSetting = await read.getEnvironmentReader().getServerSettings().getOneById('Site_Url');
        if (!siteSetting) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Can not retrieve Rocket.Chat server url`,
            };
        }

        const resDecoding = await http.get(`${ siteSetting.value }/api/v1/token.decode/${ token }`);
        if (!resDecoding || !resDecoding.content) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: `Attached access token is not valid`,
            };
        }

        const decodedToken = JSON.parse(resDecoding.content);
        if (!decodedToken || !decodedToken.result.payloadObj) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: `Attached access token is not valid`,
            };
        }

        const wopiToken = decodedToken.result.payloadObj.context;
        console.log(`Utils.checkWopiRequest: decoded token: ${ JSON.stringify(wopiToken) }`);

        const fileId = request.params.fileId;
        if (!fileId) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `No file id has been specified`,
            };
        }
        if (fileId !== wopiToken.fileId) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: `File id does not match token`,
            };
        }

        const uploadInfo = await read.getUploadReader().getById(fileId);
        if (!uploadInfo || !uploadInfo.room || !uploadInfo.user) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Upload ${ fileId } could not be found`,
            };
        }
        if (uploadInfo.room.id !== wopiToken.rid) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: `File does not belong to the expected room`,
            };
        }

        const userInfo = await read.getUserReader().getById(wopiToken.userId);
        if (!userInfo) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: `User ${ wopiToken.userId } has not been found`,
            };
        }
        console.log(`Utils.checkWopiRequest: user name: ${ userInfo.name }`);

        return {
            status: HttpStatusCode.OK,
            content: {
                uploadInfo,
                userInfo,
            },
        };
    }
}
