import "./style.css";
import { Deck } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import { MVTLayer } from "@deck.gl/geo-layers";
import axios from "axios";
import mapsApiClient from "./mapsApiClient";

const INITIAL_VIEW_STATE = {
  zoom: 4,
  longitude: -1.4982775,
  latitude: 40.109575,
  bearing: 0,
  pitch: 0
};

const deck = new Deck({
  canvas: document.getElementById("deck"),
  width: "100%",
  height: "100%",
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  useDevicePixels: true
});

function loadLayers() {
  Promise.all([
    mapsApiClient.fetchMVTTemplate("select * from ne_50m_admin_0_countries"),
    mapsApiClient.fetchMVTTemplate(
      "select cartodb_id, ST_Transform(ST_SetSRID(ST_Centroid(the_geom), 4326), 3857) as the_geom_webmercator from london_neighbourhoods"
    )
  ]).then(values => {
    const layer1 = new MVTLayer({
      id: "layer1",
      getLineColor: [192, 192, 192],
      getFillColor: [140, 170, 180],
      data: values[0].urls,
      pickable: true,
      onHover: d => console.log("layer1")
    });

    /*const layer2 = new MVTLayer({
      id: 'layer2',
      getIcon: () => ({
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Square-white.svg/1200px-Square-white.svg.png',
        width: 25,
        height: 25,
        anchorY: 25
      }),
      getSize: 25,
      data: values[1].urls,
      pickable: true,
      getPosition: (f) => f.geometry.coordinates,
      onHover: (d) => console.log('layer2'),
      renderSubLayers: (props) => {
        return new IconLayer(props);
      }
    });*/

    const layer2 = new MVTLayer({
      id: "layer2",
      data: values[1].urls,
      pickable: true,
      radiusScale: 6,
      getRadius: 10,
      radiusMinPixels: 10,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: f => f.geometry.coordinates,
      getFillColor: [255, 0, 0, 255],
      filled: true,
      pickable: true,
      onHover: d => console.log("layer2"),
      renderSubLayers: props => {
        return new ScatterplotLayer(props);
      }
    });

    deck.setProps({ layers: [layer1, layer2] });

    window.deckMap = deck;
  });
}

loadLayers();
