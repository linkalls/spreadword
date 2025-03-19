import { loadEnvConfig } from "@next/env";
import type { Config } from "drizzle-kit";

loadEnvConfig(process.cwd());

const env = process.env.BUN_ENV;
// if(process.env.BUN_ENV === "production") {
//   console.log("Production environment detected");
// } else {
//   console.log("Development environment detected");
// }

// export default {
//   schema: "./src/db/schema.ts",
//   out: "./src/db/migrations",
//   dialect: "turso",
  
//   dbCredentials: env === "production" 
//     ? {
//         url: process.env.TURSO_DATABASE_URL!,
//         authToken: process.env.TURSO_AUTH_TOKEN,
//       }
//     : {
//         url: process.env.TURSO_LOCAL_DATABASE_URL!,
//       },
// } satisfies Config;


export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  
  // dbCredentials: env === "production" 
  //   ? {
  //       url: process.env.TURSO_DATABASE_URL!,
  //       authToken: process.env.TURSO_AUTH_TOKEN,
      
  //     }
  //   : {
  //       url: process.env.TURSO_LOCAL_DATABASE_URL!,
  //       authToken: process.env.TURSO_AUTH_TOKEN,

  //     },
  dbCredentials: {
      url: process.env.DATABASE_URL!,
      authToken: process.env.AUTH_TOKEN,
    }

} satisfies Config;