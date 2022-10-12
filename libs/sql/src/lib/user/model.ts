import { field } from 'ts-object-to-model';

export class AccessLevel {

    id = 0;
  
    @field({sourceName: 'accesslevel_name'})
    accesslevelName = '';
  
    @field({sourceName: 'accesslevel_description'})
    accesslevelDescription = '';
}

export class UserRoute {
    id = 0;
  
    @field({sourceName: 'user_email'})
    userEmail = '';
  
    @field({sourceName: 'organization_id'})
    organizationId = 0;
  
    @field({sourceName: 'organization_user_id'})
    organizationUserId = 0;
  
    @field({sourceName: 'organization_user_status_id'})
    organizationUserStatusId = 0;
  
    @field({sourceName: 'organization_name'})
    organizationName = '';
  
  
    @field({sourceName: 'organization_db'})
    organizationDatabase = '';
}

export class UserInfo {
    id = 0;
  
    @field({sourceName: 'user_email'})
    userEmail = '';

    @field({sourceName: 'access_level_id'})
    accessLevelId = 0;

    @field({sourceName: 'status_id'})
    statusId = 0;

}
