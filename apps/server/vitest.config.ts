import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "test/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "**/*.db.test.ts"],
          setupFiles: ["./test/setup/env.ts"],
        },
      },
      {
        test: {
          name: "db",
          include: ["src/**/*.db.test.ts", "test/**/*.db.test.ts"],
          // One test file at a time: every file shares the one test database.
          // (`fileParallelism` is root-only in Vitest; `singleFork` is per project.)
          poolOptions: { forks: { singleFork: true } },
          globalSetup: ["./test/setup/global-setup.ts"],
          setupFiles: ["./test/setup/env.ts", "./test/setup/db.ts"],
        },
      },
    ],
  },
});
