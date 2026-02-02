import { ImageSourcePropType } from 'react-native';

// Use require.context to import all images from the assets/songs directory and its subdirectories
// The first argument is the directory to search
// The second argument (true) means to search subdirectories
// The third argument is a regular expression to match files
const imageContext = require.context('../assets/songs', true, /\.png$/);

const imageMap: { [key: string]: ImageSourcePropType } = {};

// Iterate over all found modules and populate the imageMap
imageContext.keys().forEach((key: string) => {
  // key will be something like './fex/fex-1.png'
  // We need to extract 'fex-1' as the songId
  const fileName = key.split('/').pop() || ''; // 'fex-1.png'
  let songId = fileName.replace(/\.png$/, ''); // 'fex-1'

  // Handle var-29.png.png case if it exists (remove the extra .png)
  if (songId.endsWith('.png')) {
    songId = songId.replace(/\.png$/, '');
  }

  imageMap[songId] = imageContext(key);
});

// Fallback image in case a banner image is not found
const defaultBanner = require('../assets/images/adaptive-icon.png');

export const getBannerImage = (songId: string): ImageSourcePropType => {
  return imageMap[songId] || defaultBanner;
};
