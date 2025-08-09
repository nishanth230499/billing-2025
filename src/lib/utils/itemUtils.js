export const getFullItemName = (item) =>
  `${item?.company?.shortName ? `${item?.company?.shortName} - ` : ''}${
    item?.name
  }`
