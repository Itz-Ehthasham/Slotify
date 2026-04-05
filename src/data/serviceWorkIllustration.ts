

const iconCleaning = require('../../assets/icons/cleaning.svg');
const iconSaloon = require('../../assets/icons/saloon.svg');
const iconRepairing = require('../../assets/icons/repairing.svg');
const iconPainter = require('../../assets/icons/painter.svg');
const iconPlumber = require('../../assets/icons/plumber.svg');
const iconSmarthome = require('../../assets/icons/smarthome.svg');
const iconCarpenter = require('../../assets/icons/carpenter.svg');

/** ~57KB — OK for SvgXml */
const imgCarpenter = require('../../assets/images/carpenter.svg');
/** ~482KB */
const imgItGuy = require('../../assets/images/ITguy.svg');
/** ~232KB */
const imgCleaningGuy = require('../../assets/images/cleaningguy.svg');

const BY_CATEGORY_LOWER: Record<string, number> = {
  // Cleaning → was Floor-cleaning.svg (huge); icon is the reliable stand-in
  cleaning: iconCleaning,
  'hair salon': iconSaloon,
  // TV repair → was display-fix.svg (huge)
  'tv repair': iconRepairing,
  carpenter: imgCarpenter,
  // Painting → was painting.svg (huge)
  painting: iconPainter,
  // Plumbing → was house-cleaning.svg (huge)
  plumbing: iconPlumber,
  electrician: imgItGuy,
  'smart home': iconSmarthome,
  handyman: imgCarpenter,
};

export function getServiceWorkAssetModule(category: string | undefined): number {
  const key = category?.trim().toLowerCase() ?? '';
  return BY_CATEGORY_LOWER[key] ?? imgCleaningGuy;
}
