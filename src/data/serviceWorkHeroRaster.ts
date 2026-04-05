import type { ImageSourcePropType } from 'react-native';

/**
 * PNG heroes for provider profile (“Work they do”).
 * Keys are lowercase `category` strings (see Home labels / `PROVIDERS_BY_SERVICE`).
 *
 * Files live in `assets/images/services/`.
 */

export const SERVICE_HERO_RASTER: Partial<Record<string, ImageSourcePropType>> = {
  cleaning: require('../../assets/images/services/house-cleaning.png'),
  carpenter: require('../../assets/images/services/carpainting.png'),
  painting: require('../../assets/images/services/painting.png'),
  'hair salon': require('../../assets/images/services/saloon.png'),
  'smart home': require('../../assets/images/services/smart-services.png'),
  'tv repair': require('../../assets/images/services/tv-repair.png'),
  handyman: require('../../assets/images/services/handyman.png'),
  /** File name as added in repo (`electronic pair.png`) */
  electrician: require('../../assets/images/services/electronic pair.png'),
  /** Featured card category — reuse general work imagery */
  repairing: require('../../assets/images/services/handyman.png'),
};
