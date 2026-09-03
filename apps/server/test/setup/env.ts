// Per-worker setup: runs before each test file's imports in both Vitest projects.
import { loadTestEnv } from "./test-env";

loadTestEnv();
