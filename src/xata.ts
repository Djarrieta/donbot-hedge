// Generated by Xata Codegen 0.28.3. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "users",
    columns: [
      { name: "key", type: "string", notNull: true, defaultValue: '""' },
      { name: "secret", type: "string", defaultValue: '""' },
      { name: "isActive", type: "bool", notNull: true, defaultValue: "false" },
      { name: "name", type: "text" },
      {
        name: "authorized",
        type: "bool",
        notNull: true,
        defaultValue: "false",
      },
      { name: "branch", type: "string" },
      { name: "startTime", type: "datetime" },
      { name: "endTime", type: "datetime" },
    ],
  },
  {
    name: "reports",
    columns: [
      { name: "value", type: "int" },
      { name: "time", type: "datetime" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Users = InferredTypes["users"];
export type UsersRecord = Users & XataRecord;

export type Reports = InferredTypes["reports"];
export type ReportsRecord = Reports & XataRecord;

export type DatabaseSchema = {
  users: UsersRecord;
  reports: ReportsRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Dar-o-Arrieta-s-workspace-3c7o2n.us-east-1.xata.sh/db/donbot",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
