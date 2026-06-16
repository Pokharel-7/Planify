const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase's newer versions ship a package "exports" field that Metro
// doesn't fully support yet, causing "Unable to resolve firebase/auth"
// errors. Disabling package exports resolution makes Metro fall back to
// the older, more compatible "main"/"browser" fields instead.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
