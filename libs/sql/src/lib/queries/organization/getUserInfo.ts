const getUserInfo = `
SELECT Users.id, first_name, middle_initial, last_name, email, phone, title_id, other_title, access_level_id, status_id, email_subscription,
user_commodity_ids, user_geography_ids,
viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency
FROM Users
LEFT JOIN (SELECT user_id, STRING_AGG(CONVERT(VARCHAR(3),commodity_id), ',') AS user_commodity_ids
           FROM UserCommodities
           WHERE user_id = @userID
           GROUP BY user_id) as UserComm on Users.id = UserComm.user_id
LEFT JOIN (SELECT user_id, STRING_AGG(CONVERT(VARCHAR(3),geography_id), ',') AS user_geography_ids
           FROM UserGeographies
           WHERE user_id = @userID
           GROUP BY user_id) as UserGeos on Users.id = UserGeos.user_id
WHERE Users.id = @userID`;

export { getUserInfo };
