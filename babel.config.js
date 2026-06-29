module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for your module resolver usage
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            "@": "./"
          },
        },
      ],
      // Required for Reanimated (v4 moved the plugin into react-native-worklets)
      'react-native-worklets/plugin',
    ],
  };
};