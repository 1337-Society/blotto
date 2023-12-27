import codegen from "@cosmwasm/ts-codegen";

codegen({
  contracts: [
    {
      name: "blotto",
      dir: "./contracts/cw-blotto/schema"
    }
  ],
  outPath: "./codegen",
  options: {
    bundle: {
      bundleFile: "index.ts",
    },
    types: {
      enabled: true,
    },
    client: {
      enabled: true,
      execExtendsQuery: true,
    },
    reactQuery: {
      enabled: true,
      optionalClient: true,
      version: "v4",
      mutations: true,
      queryKeys: true,
      queryFactory: true,
    },
  },
}).then(() => {
  console.log("✨ all done!");
});
