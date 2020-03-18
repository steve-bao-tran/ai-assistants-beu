/* tslint:disable */
if (process.env.TEST_MODE === "live") {
  require("./production.spec");
} else {
  require("./develop.spec");
}
