export const getUserInfoByEmail = `SELECT
U.id, U.first_name, U.middle_initial, U.last_name, U.email, U.phone,
U.title_id, U.other_title, U.access_level_id, U.status_id, U.email_subscription
FROM Users U
LEFT JOIN UserCommodities UC ON U.id = UC.user_id
LEFT JOIN UserGeographies UG ON U.id = UG.user_id
WHERE U.email = @userEmail`;

export class UserInfo {
  id: number;
  first_name: string;
  middle_initial: string;
  last_name: string;
  email: string;
  phone: string;
  title_id: number;
  other_title: string;
  access_level_id: number;
  status_id: number;
  email_subscription: boolean;
}
