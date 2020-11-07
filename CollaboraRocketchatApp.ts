import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify, IHttp,
    ILogger, IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { CheckFileInfoEndpoint } from './CheckFileInfoEndpoint';
import { GetCollaboraOnlineFileURL } from './GetCollaboraOnlineFileURL';
import { GetFileEndpoint } from './GetFileEndpoint';

export class CollaboraRocketchatApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        // Register API endpoints
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new CheckFileInfoEndpoint(this),
                new GetFileEndpoint(this),
                new GetCollaboraOnlineFileURL(this),
        });

        // Register Settings
        await configuration.settings.provideSetting({
            /** The id of this setting. */
            id: 'OnlineServerUrl',
            /** Type of setting this is. */
            type: SettingType.STRING,
            /** What is the default value (allows a reset button). */
            packageValue: 'http://localhost',
            /** Whether this setting is required or not. */
            required: true,
            /** Whether this setting is a public setting or not - administrators can see ones which are not public but users can't. */
            public: false,
            /** Name of the setting in the form of a i18n string. */
            i18nLabel: 'Collabora_Online_Server',
        });
    }

    public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        console.log(`CollaboraRocketchatApp.onSettingUpdated: ${ JSON.stringify(setting) }`);
        if (setting.id === 'OnlineServerUrl') {
            const wopiAddress = setting.value || setting.packageValue;
            console.log(`onSettingUpdated: wopiAddress: ${ wopiAddress }`);
        }
    }
}
