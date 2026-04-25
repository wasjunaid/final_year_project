require("dotenv").config();
const { uploadToIPFS, getFromIPFS, listPinnedFiles } = require("./src/utils/ipfs");

(async () => {
  try {
    console.log("=== Testing Pinata IPFS Connection ===\n");

    // Test 1: Upload JSON
    console.log("Test 1: Uploading JSON object...");
    const testData = {
      patient: {
        id: "P123",
        name: "Test Patient",
        diagnosis: "Sample EHR",
        timestamp: new Date().toISOString(),
      },
    };

    const cid = await uploadToIPFS(testData);
    console.log("\n✓ JSON Upload successful!");
    console.log("CID:", cid);

    // Test 2: Retrieve content
    console.log("\n\nTest 2: Fetching content back...");
    const retrieved = await getFromIPFS(cid);
    console.log("Retrieved content:");
    console.log(retrieved);
    console.log("\n✓ Fetch successful!");

    // Test 3: Upload string
    console.log("\n\nTest 3: Uploading plain text...");
    const textCid = await uploadToIPFS("Hello from Healthcare System!");
    console.log("\n✓ Text upload successful!");
    console.log("CID:", textCid);

    // Test 4: List pinned files
    console.log("\n\nTest 4: Listing pinned files...");
    const pinnedFiles = await listPinnedFiles();
    console.log(`\n✓ Total pinned files: ${pinnedFiles.length}`);
    console.log("Recent pins:");
    pinnedFiles.slice(0, 3).forEach((file) => {
      console.log(`  - ${file.ipfs_pin_hash} (${file.metadata?.name || "unnamed"})`);
    });

    console.log("\n\n=== All Tests Passed! ===");
    console.log(`\nView JSON in browser: https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(`View text in browser: https://gateway.pinata.cloud/ipfs/${textCid}`);

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Test failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
})();