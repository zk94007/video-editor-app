up:
CREATE TABLE `user` (
  `usr_id` smallint(1) NOT NULL AUTO_INCREMENT,
  `usr_userid` varchar(100) CHARACTER SET utf8 NOT NULL,
  `usr_email` varchar(256) CHARACTER SET utf8 NOT NULL,
  `usr_password` varchar(256) CHARACTER SET utf8 NOT NULL,
  `usr_is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `usr_is_allowed` tinyint(1) NOT NULL DEFAULT '1',
  `usr_lastlogin_at` datetime DEFAULT NULL,
  `usr_created_at` datetime DEFAULT NULL,
  `usr_name` varchar(256) CHARACTER SET utf8 NOT NULL,
  `usr_company` varchar(256) CHARACTER SET utf8 NOT NULL,
  `usr_is_get_started` tinyint(1) NOT NULL DEFAULT '0',
  `usr_profile_path` varchar(256) CHARACTER SET utf8 NOT NULL,
  `usr_admin_status` tinyint(1) NOT NULL DEFAULT '0',
  `usr_role` tinyint(2) NOT NULL DEFAULT '2',
  PRIMARY KEY (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
down:
DROP TABLE `user`;