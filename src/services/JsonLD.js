function getJsonLD(selectedStation) {
  return `{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "AvialablesBikes",
            item: ${selectedStation.available_bikes}
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "AvialablesStands",
            item: ${selectedStation.available_bike_stands}
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "NumberOfStands",
            item: ${selectedStation.nb_bike_stands}
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "LastUpdate",
            item: ${selectedStation.last_update}
          }
        ]
      }`;
}

export { getJsonLD };
