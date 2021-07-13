/* eslint-disable*/

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFwdHl2aXZlayIsImEiOiJja3FyeWQyaWwxbGI3MnVtaDBlZ3QxcDJuIn0.96kSj7yYkizjBQGYMDuX-w';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/maptyvivek/ckqs8o5ij1qd419lt3gz5mnlr',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 9,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // ADD a marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //ADD popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}`)
      .addTo(map);

    //extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 150,
      right: 150
    }
  });
};
