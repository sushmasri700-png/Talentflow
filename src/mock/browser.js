import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { seedIfEmpty } from "./seed";

export const worker = setupWorker(...handlers);

export async function initMocks() {
  // Seed DB first
  await seedIfEmpty();

  // Start MSW worker (dev only)
  await worker.start({
    onUnhandledRequest: "warn",
  });

  console.log("✅ MSW started (dev only)");
}
