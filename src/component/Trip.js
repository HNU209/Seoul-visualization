import React, { useState, useEffect } from 'react';
import { StaticMap } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import '../css/trip.css'

const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70],
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: 127,
  latitude: 37.55,
  zoom: 11,
  minZoom: 5,
  maxZoom: 16,
  pitch: 20,
  bearing: 0,
};

const landCover = [
  [
    [-74.0, 40.7],
    [-74.02, 40.7],
    [-74.02, 40.72],
    [-74.0, 40.72],
  ],
];

// const ICON_MAPPING = {
//   marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
// };

function renderLayers(props) {
  const theme = DEFAULT_THEME;
  const time = props.time;
  const trip = props.trip;

  return [
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      getPolygon: (f) => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0],
    }),
    new TripsLayer({
      id: 'trip',
      data: trip,
      getPath: (d) => d.trips,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) => 
      d.vendor === 0 ? theme.trailColor0 : theme.trailColor1,
      opacity: 0.3,
      widthMinPixels: 1.5,
      lineJointRounded: false,
      trailLength: 0.3,
      currentTime: time,
      shadowEnabled: false,
    }),
  ];
}

export default function Trip(props) {
  const minTime = props.minTime;
  const maxTime = props.maxTime;

  const animationSpeed = 4;
  const time = props.time;
  const trip = props.trip;

  const [animationFrame, setAnimationFrame] = useState('');
  const viewState = undefined;
  const mapStyle = 'mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc';
  
  function animate() {
    props.setTime(time => {
      if (time > maxTime) {
        props.setReset(true)
        return minTime;
      } else {
        return time + (0.01) * animationSpeed;
      }
    })
    const af = window.requestAnimationFrame(animate);
    setAnimationFrame(af);
  }

  useEffect(() => {
    animate()
    return () => window.cancelAnimationFrame(animationFrame);
  }, [])

  return (
    <div className="trip-container" style={{position:'relative'}}>
      <DeckGL
        layers={renderLayers({'trip':trip, 'time':time})}
        effects={DEFAULT_THEME.effects}
        viewState={viewState}
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
      >
        <StaticMap
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
      <h1 className="time">
        TIME : {(String(parseInt(Math.round(time) / 60) % 24).length === 2) ? parseInt(Math.round(time) / 60) % 24 : '0'+String(parseInt(Math.round(time) / 60) % 24)} : {(String(Math.round(time) % 60).length === 2) ? Math.round(time) % 60 : '0'+String(Math.round(time) % 60)}
      </h1>
      
    </div>
  );
}