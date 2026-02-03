module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Reanimated
      'react-native-reanimated/plugin',
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
    ],
  };
};