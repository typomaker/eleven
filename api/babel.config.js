const presets = [
    ["@babel/preset-env", {
        targets: {
            node: true
        },
        useBuiltIns: "usage"
    }],
];
const plugins = [
    // "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-namespace-from"
];

module.exports = {presets, plugins};
