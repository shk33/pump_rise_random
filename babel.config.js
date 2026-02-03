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
      // Required for Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};