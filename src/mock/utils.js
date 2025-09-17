// src/mocks/utils.js
import { nanoid } from "nanoid";

/**
 * Simulate network latency and optional random write errors.
 * options: { min:200, max:1200, writeErrorRate: 0.07 }
 */
export const simulateNetwork = async (opts = {}) => {
  const { min = 200, max = 1200 } = opts;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((res) => setTimeout(res, delay));
};

export const shouldFail = (writeErrorRate = 0.08) => {
  return Math.random() < writeErrorRate;
};

export const makeSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const uid = () => nanoid();
