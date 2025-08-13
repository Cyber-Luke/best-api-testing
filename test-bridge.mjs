#!/usr/bin/env node

// Test bridge script to load TypeScript tests and export them as JSON
import "reflect-metadata";
import { TestRegistry } from "../dist/framework/registry.js";
import { pathToFileURL } from "url";
import { writeFileSync } from "fs";

const testFile = process.argv[2];
const outputFile = process.argv[3];

if (!testFile || !outputFile) {
  console.error("Usage: test-bridge.mjs <test-file> <output-file>");
  process.exit(1);
}

async function loadTest() {
  try {
    // Clear registry
    TestRegistry.clear();

    // Import the test file
    const fileUrl = pathToFileURL(testFile).href;
    await import(fileUrl);

    // Get all registered tests
    const tests = TestRegistry.list();

    // Write tests to output file as JSON
    const testData = tests.map((test) => ({
      name: test.name,
      auth: test.auth,
      // We can't serialize the function, so we'll have to handle that differently
      fnString: test.fn.toString(),
    }));

    writeFileSync(outputFile, JSON.stringify(testData, null, 2));

    console.log(`Exported ${tests.length} tests to ${outputFile}`);
    process.exit(0);
  } catch (error) {
    console.error("Error loading test:", error.message);
    process.exit(1);
  }
}

loadTest();
