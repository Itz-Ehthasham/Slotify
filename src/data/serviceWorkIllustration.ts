const iconCleaning = require('../../assets/icons/cleaning.svg');
const iconSaloon = require('../../assets/icons/saloon.svg');
const iconRepairing = require('../../assets/icons/repairing.svg');
const iconPainter = require('../../assets/icons/painter.svg');
const iconPlumber = require('../../assets/icons/plumber.svg');
const iconSmarthome = require('../../assets/icons/smarthome.svg');
const iconCarpenter = require('../../assets/icons/carpenter.svg');

const imgCarpenter = require('../../assets/images/carpenter.svg');
const imgItGuy = require('../../assets/images/ITguy.svg');
const imgCleaningGuy = require('../../assets/images/cleaningguy.svg');

const BY_CATEGORY_LOWER: Record<string, number> = {
  cleaning: iconCleaning,
  'hair salon': iconSaloon,
  'tv repair': iconRepairing,
  carpenter: imgCarpenter,
  painting: iconPainter,
  plumbing: iconPlumber,
  electrician: imgItGuy,
  'smart home': iconSmarthome,
  handyman: imgCarpenter,
};

export function getServiceWorkAssetModule(category: string | undefined): number {
  const key = category?.trim().toLowerCase() ?? '';
  return BY_CATEGORY_LOWER[key] ?? imgCleaningGuy;
}
