export const demoManageFrabricsSlugs = {
  fabricsMasterData: "fabrics-master-data",
  lengthInventoryTracking: "length-inventory-tracking",
} as const;

export const demoManageFrabricsFeatures = [
  {
    slug: demoManageFrabricsSlugs.fabricsMasterData,
    title: "Fabrics Master Data",
  },
  {
    slug: demoManageFrabricsSlugs.lengthInventoryTracking,
    title: "Length & Inventory Tracking",
  },
] as const;
