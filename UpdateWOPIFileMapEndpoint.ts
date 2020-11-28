import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { WOPI_FILE_MAP } from './Utils';

export class UpdateWOPIFileMapEndpoint extends ApiEndpoint {
    public path = '/wopiFileMap.update';

    public async post(
        request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence,
    ): Promise<IApiResponse> {
        console.log(`UpdateWOPIFileMapEndpoint: request: ${ JSON.stringify(request) }`);
        const wopiAddress = request.content;
        if (!wopiAddress) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Online server address could not be found`,
            };
        }

        const WOPIFileMap = {};
        const response = await http.get(`${ wopiAddress }/hosting/discovery`);
        if (!response || !response.content) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Wopi discovery.xml could not be retrieved`,
            };
        }

        const siteSetting = await read.getEnvironmentReader().getServerSettings().getOneById('Site_Url');
        if (!siteSetting) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Can not retrieve Rocket.Chat server url`,
            };
        }
        const requestForParser = {
            content: response.content,
        };
        const parserRes = await http.get(`${ siteSetting.value }/api/v1/xml.parser/`, requestForParser);
        if (!parserRes || !parserRes.content) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Wopi discovery.xml could not be parsed`,
            };
        }

        const parsedDoc = JSON.parse(parserRes.content);
        // console.log(`onSettingUpdated: parsed doc: ${ JSON.stringify(parsedDoc) }`);
        const appsProp = parsedDoc['wopi-discovery']['net-zone'][0]['app'];
        for (const appProp of appsProp) {
            const actionProp = appProp['action'][0]['$'];
            const ext = actionProp.ext.toLowerCase();
            if (ext.length === 0 || ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') {
                continue;
            }
            WOPIFileMap[ext] = { url: actionProp.urlsrc, action: actionProp.name };
        }
        // console.log(`UpdateWOPIFileMapEndpoint: WOPIFileMap: ${ JSON.stringify(WOPIFileMap) }`);

        await persis.updateByAssociation(WOPI_FILE_MAP, WOPIFileMap, true);

        return this.success();
    }
}
