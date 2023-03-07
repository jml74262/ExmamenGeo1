import '../styles/entrega.css';
import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import { fromLonLat } from 'ol/proj';
import { transform } from 'ol/proj';

const nombre = localStorage.getItem('name');
const latitud = Number(localStorage.getItem('latitude'));
const longitud = Number(localStorage.getItem('longitude'));
console.log(latitud)
console.log(longitud)

const view = new View({
  center: [0, 0],
  zoom: 14,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view,
});

const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
  tracking : true
});

function el(id) {
  return document.getElementById(id);
}

// el('track').addEventListener('change', function () {
//   geolocation.setTracking(this.checked);
// });

// // update the HTML page when the position changes.
// geolocation.on('change', function () {
//   el('coordinates').innerText = geolocation.getPosition() + ' [l/l]';
// });

// handle geolocation error.
geolocation.on('error', function (error) {
  const info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#black',
        width: 3,
      }),
    }),
  })
);

const nuevaCoordenada = new Point(fromLonLat([longitud,latitud]))

const deliveryFeature = new Feature(nuevaCoordenada);
deliveryFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({
        color: "purple"
      }),
      stroke: new Stroke({
        color: '#black',
        width: 3
      })
    })
  })
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  view.setCenter(coordinates);
  
  const x = geolocation.getPosition()[0];
  const y = geolocation.getPosition()[1];
  const sourceProj = 'EPSG:3857'; // la proyección de tus coordenadas x,y
  const destProj = 'EPSG:4326'; // la proyección de destino
  
  const lonLat = transform([x, y], sourceProj, destProj);
  console.log(lonLat);

  const lon = lonLat[0];
  const lat = lonLat[1];
  console.log("Longitud",lonLat[0])
  console.log("Latitud",lonLat[1])

  // Convertir las coordenadas de latitud y longitud a radianes
  const lat1 = (Math.PI * lat) / 180;
  const lon1 = (Math.PI * lon) / 180;

  // Calcular la distancia en km correspondiente a 10 km
  const R = 6371; // radio de la tierra en km
  const d = 4; // distancia en km
  const dist = d / R;

  // Calcular el rango de coordenadas
  const latMin = (180 / Math.PI) * (lat1 - dist);
  const latMax = (180 / Math.PI) * (lat1 + dist);
  const lonMin = (180 / Math.PI) * (lon1 - dist / Math.cos(lat1));
  const lonMax = (180 / Math.PI) * (lon1 + dist / Math.cos(lat1));

  // Verificar si la latitud y longitud están dentro del rango
  if (latitud < latMin || latitud > latMax || longitud < lonMin || longitud > lonMax) {
    window.alert("Coordenadas no validas")
  } else {
    console.log("La latitud y longitud están dentro del rango.");
    const nom = document.getElementById('nombreInicial');
    nom.innerHTML = "Hola: "+nombre;
    // window.alert("Hola: "+nombre)
  }
    
});



const source = new VectorSource({
  features: [accuracyFeature, positionFeature],
})


new VectorLayer({
  map: map,
  source: source
});

source.addFeature(deliveryFeature)


function xyToLonLat(x, y) {
  const lonLat = ol.proj.transform([x, y], 'EPSG:3857', 'EPSG:4326');
  const lon = lonLat[0];
  const lat = lonLat[1];
  return [lon, lat];
}


// function validarCoordenadas(lat1, lon1, lat2, lon2) {
//   const radioTierra = 6371; // radio de la Tierra en kilómetros
//   const distanciaLat = (lat2 - lat1) * Math.PI / 180; // diferencia en latitud convertida a radianes
//   const distanciaLon = (lon2 - lon1) * Math.PI / 180; // diferencia en longitud convertida a radianes
//   const a =
//     Math.sin(distanciaLat / 2) * Math.sin(distanciaLat / 2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(distanciaLon / 2) * Math.sin(distanciaLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distancia = radioTierra * c; // distancia entre las dos coordenadas en kilómetros

//   return distancia <= 100; // retorna true si la distancia es menor o igual a 5 km
// }



