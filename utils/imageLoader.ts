import { ImageSourcePropType } from 'react-native';

// Banners are now flat JPEGs in assets/songs/, named <songId>.jpg
// (songId === Song.id === Song.banner, e.g. "10001.jpg", "13a3.jpg").
const imageContext = require.context('../assets/songs', false, /\.jpg$/);

const imageMap: { [key: string]: ImageSourcePropType } = {};
imageContext.keys().forEach((key: string) => {
  const fileName = key.split('/').pop() || '';     // "10001.jpg"
  const songId = fileName.replace(/\.jpg$/, '');   // "10001"
  imageMap[songId] = imageContext(key);
});

const defaultBanner = require('@/assets/images/adaptive-icon.png');

export const getBannerImage = (songId: string): ImageSourcePropType => {
  return imageMap[songId] || defaultBanner;
};
