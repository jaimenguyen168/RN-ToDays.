const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require("expo/metro-config");
// const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// const config = getSentryExpoConfig(__dirname, {
//   annotateReactComponents: true,
// });

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: "./src/global.css" });