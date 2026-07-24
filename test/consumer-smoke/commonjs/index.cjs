const assert = require("node:assert/strict");

assert.throws(
  () => require("region-kit"),
  (error) => {
    assert.equal(error.code, "ERR_PACKAGE_PATH_NOT_EXPORTED");
    return true;
  },
);

console.log("CommonJS negative smoke test passed.");
