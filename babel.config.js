/* eslint-disable */
module.exports = (api) => {
  const envOptions = {};

  // Options scaffolded by Quasar out of the box
  if (api.caller((caller) => caller && caller.target === "node")) {
    envOptions.targets = { node: "current" };
  }

  // Only used in test environment in JS codebases
  if (api.env() === "test") {
    envOptions.modules = "commonjs";
    envOptions.targets = { node: "current" };
  }

  return {
    presets: [["@quasar/babel-preset-app", envOptions]],
  };
};
