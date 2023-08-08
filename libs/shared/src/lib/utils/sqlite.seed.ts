import { DataSource } from 'typeorm';

export async function createTables(connection: DataSource) {
  await connection.query(`
        CREATE TABLE "Organizations" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "organization_name" TEXT,
            "organization_db" TEXT,
            "organization_status_id" INTEGER,
            "organization_activated_time" TEXT,
            "subscription_status_id" INTEGER
        )
    `);

  await connection.query(`
        CREATE TABLE "Connection_Request" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "id_source_organization" INTEGER,
            "id_target_organization" INTEGER,
            "create_date" TEXT,
            "source_email" TEXT,
            "initial_target_email" TEXT
        )
    `);

  await connection.query(`
        CREATE TABLE "Connection_Shared_List" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "id_connection_request" INTEGER,
            "id_list" INTEGER,
            "edited_date" TEXT,
            "shared_with_geometry" INTEGER,
            "enabled" INTEGER
        )
    `);

  await connection.query(`
        CREATE TABLE "Connection_Status" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "id_status" INTEGER,
            "id_connection_request" INTEGER,
            "editor_email" TEXT,
            "edited_date" TEXT
        )
    `);

  await connection.query(`
        CREATE TABLE "Connection_Values_Status" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "status" TEXT,
            "description" TEXT
        )
    `);

  await connection.query(`
        CREATE TABLE "Users" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "first_name" TEXT,
            "middle_initial" TEXT,
            "last_name" TEXT,
            "email" TEXT,
            "phone" TEXT,
            "title_id" INTEGER,
            "other_title" TEXT,
            "access_level_id" INTEGER,
            "status_id" INTEGER,
            "activated_time" TEXT,
            "email_subscription" INTEGER,
            "is_system_user" INTEGER,
            "initial_login" TEXT,
            "viirs_email_frequency" INTEGER,
            "glad_email_frequency" INTEGER,
            "forma_email_frequency" INTEGER,
            "terrai_email_frequency" INTEGER,
            "gran_chaco_email_frequency" INTEGER
        )
    `);
}

export const createUsersTable = async (connection: DataSource) => {
  await connection.query(`
        CREATE TABLE "Users" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "first_name" TEXT,
            "middle_initial" TEXT,
            "last_name" TEXT,
            "email" TEXT,
            "phone" TEXT,
            "title_id" INTEGER,
            "other_title" TEXT,
            "access_level_id" INTEGER,
            "status_id" INTEGER,
            "activated_time" TEXT,
            "email_subscription" INTEGER,
            "is_system_user" INTEGER,
            "initial_login" TEXT,
            "viirs_email_frequency" INTEGER,
            "glad_email_frequency" INTEGER,
            "forma_email_frequency" INTEGER,
            "terrai_email_frequency" INTEGER,
            "gran_chaco_email_frequency" INTEGER
        )
    `);
};

export const createUsersRecords = async (connection: DataSource) => {
  await connection.query(`INSERT INTO "Users" ("id", "first_name", "middle_initial", "last_name", "email", "phone", "title_id", "other_title", "access_level_id", "status_id", "activated_time", "email_subscription", "is_system_user", "initial_login", "viirs_email_frequency", "glad_email_frequency", "forma_email_frequency", "terrai_email_frequency", "gran_chaco_email_frequency") VALUES (9, 'Pro', '', 'SuperOne', 'prosupertester1@gmail.com', '+1 (703) 875-0911', 10, '', 1, 2, '2018-10-17 20:05:00', 0, 1, NULL, 0, 0, 0, 0, 0);
  INSERT INTO "Users" ("id", "first_name", "middle_initial", "last_name", "email", "phone", "title_id", "other_title", "access_level_id", "status_id", "activated_time", "email_subscription", "is_system_user", "initial_login", "viirs_email_frequency", "glad_email_frequency", "forma_email_frequency", "terrai_email_frequency", "gran_chaco_email_frequency") VALUES (10043, 'Jose', '', 'Quiroz', 'jose.quiroz.5@wriconsultant.org', '1111111111', 1, '', 1, 2, '2023-02-24 12:32:00', 0, 0, NULL, 0, 0, 0, 0, 0);
    `);
};

export const createConnectionTables = async (connection: DataSource) => {
    await connection.query(`
        CREATE TABLE "Connection_Status" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "id_status" INTEGER,
            "id_connection_request" INTEGER,
            "editor_email" TEXT,
            "edited_date" TEXT
        )
    `);

  await connection.query(`
        CREATE TABLE "Connection_Values_Status" (
            "id" INTEGER PRIMARY KEY NOT NULL,
            "status" TEXT,
            "description" TEXT
        )
    `);
}

