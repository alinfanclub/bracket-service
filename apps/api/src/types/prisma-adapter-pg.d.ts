declare module "@prisma/adapter-pg" {
  import type { SqlDriverAdapter, SqlMigrationAwareDriverAdapterFactory } from "@prisma/driver-adapter-utils";

  export class PrismaPg {
    readonly provider: "postgres";
    readonly adapterName: string;
    constructor(poolOrConfig: string | { connectionString?: string }, options?: unknown);
    connect(): Promise<SqlDriverAdapter>;
    connectToShadowDb(): Promise<SqlDriverAdapter>;
  }

  const _factoryCheck: SqlMigrationAwareDriverAdapterFactory;
}
