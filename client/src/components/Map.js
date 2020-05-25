import React, { useEffect, useRef, useState } from 'react';
import { usePosition } from "use-position";
import mapboxgl from 'mapbox-gl';
import { point, center, featureCollection, distance } from '@turf/turf';
import getInfoFromNowStatus from '../getInfoFromNowStatus';

import '../styles/map.css';

import analytics from '../analytics';

const DEFAULT_COORDS_LAT = 40.747738;
const DEFAULT_COORDS_LNG = -73.986894;
const THRESHOLD = 0.01;

const copyrightEl = `
<div class="attribWrapper">
  &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>
  &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
  <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>
</div>
`;

const searchEl = `
<div class="mapSearchWrapper">
  <div class="mapSearch">
    <img src="${process.env.PUBLIC_URL}/icon-search-map.svg" width="16" height="16" />
    Search current location
  </div>
</div>
`;

const isOverThreshold = (a, b) => {
 return Math.abs(Number(a) - Number(b)) > THRESHOLD;
}

export const Map = ({
  data,
  day,
  time,
  mapCoords,
  loading,
  setLoading,
  mapRef,
  handleMapSearch,
  mapLoading,
  excludeNoTimeData
}) => {
  const initialZoom = 15;
  const markers = useRef([]);
  const mapContainerRef = useRef(null);
  const { latitude, longitude, error } = usePosition(false);
  const prevUserGps = useRef({ latitude, longitude });
  const timeoutRef = useRef(null);

  const setUpMap = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const center = longitude && latitude ? [longitude, latitude] : [DEFAULT_COORDS_LNG, DEFAULT_COORDS_LAT];
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: {
        "version": 8,
        "sources": {
          "raster-tiles": {
            "type": "raster",
            "tiles": [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            "tileSize": 256,
          }
        },
        "layers": [{
          "id": "simple-tiles",
          "type": "raster",
          "source": "raster-tiles",
          "minzoom": 0,
          "maxzoom": 20
        }]
      },
      center: center,
      zoom: initialZoom,
      attributionControl: false,
      dragRotate: false
    });
    const map = mapRef.current;
    const coords = map.getCenter();
    mapCoords.current = { lat: coords.lat.toFixed(6), lng: coords.lng.toFixed(6) };

    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'top-left');

    map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left');

    map.on('load', () => {
      if (loading) {
        setLoading(false);
        document.getElementsByClassName('mapContainer')[0].insertAdjacentHTML('afterbegin', copyrightEl);
        document.getElementsByClassName('mapContainer')[0].insertAdjacentHTML('afterbegin', searchEl);
        document.getElementsByClassName('mapSearch')[0].addEventListener("click", () => handleMapSearch(excludeNoTimeData));
      }
    });

    map.on("wheel", event => {
      // avoid zooming when user is scrolling the page
      if (event.originalEvent.ctrlKey || event.originalEvent.metaKey || event.originalEvent.altKey) {
        return;
      }
      event.preventDefault();
    });

    handleMapSearch();
  }

  const handleNoUserGps = () => {
    if (!mapRef.current && (!latitude || !longitude)) {
      setUpMap();
    }
  }

  useEffect(() => {
    // If user's gps isn't set in 5 sec, call handleNoUserGps() once
    timeoutRef.current = setTimeout(handleNoUserGps, 5000);
  }, []);

  useEffect(() => {
    if (!latitude || !longitude || !mapContainerRef.current) {
      return;
    }
    if (!mapRef.current) {
      setUpMap();
    } else if (isOverThreshold(prevUserGps.current.latitude, latitude) || isOverThreshold(prevUserGps.current.longitude, longitude)) {
      const map = mapRef.current;
      map.jumpTo({
        center: [longitude, latitude],
        zoom: initialZoom
      });
      mapCoords.current = { lat: latitude.toFixed(6), lng: longitude.toFixed(6) };
      handleMapSearch();
    }
    prevUserGps.current = { latitude, longitude };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapRef.current || !mapContainerRef) return;
    markers.current.forEach(marker => {
      marker.remove();
    });
    const fromPoint = longitude && latitude ? point([ longitude, latitude ]) : null;
    const newMarkers = [];
    const turfPoints = [];
    for (let loc of data.locations) {
      if (!isNaN(Number(loc.longitude)) && !isNaN(Number(loc.latitude))) {
        const lnglat = { lng: Number(loc.longitude), lat: Number(loc.latitude) };
        const toPoint = point([ lnglat.lng, lnglat.lat ]);
        turfPoints.push(toPoint);
        loc.distance = fromPoint ? Number(distance(fromPoint, toPoint)).toFixed(4) : '?';
        let statusStr = '';
        if (day === -1) {
          statusStr = loc.nowStatus;
        } else if (loc.allStatus && loc.allStatus[day]) {
          const stat = loc.allStatus[day].filter(stat => stat.time === time)[0];
          statusStr = stat && stat.status && stat.status !== '' ? stat.status : 'No popular times data';
        } else {
          statusStr = 'No popular times data';
        }
        const { status, img } = getInfoFromNowStatus(statusStr);

        let popupEl = document.createElement('div');
        popupEl.className = 'popup-inner';
        popupEl.innerHTML = `
          <div class="top">
            <div class="crowded-${status}">${statusStr}</div>
            ${day === -1 && loc.live ?'<div class="live"><span class="dot"></span>Live</div>' : ''}
          </div>
          <div class="middle">
            <div>${loc.name}</div>
            <div><img src="${process.env.PUBLIC_URL}/popup_distance.svg"/>${loc.distance} km</div>
            <div>${loc.address}</div>
          </div>
          <div class="bottom">
            <a class="view" href=${encodeURI(loc.link)}>VIEW</a>
            <a class="directions" href=${encodeURI(loc.directions)}>DIRECTIONS</a>
          </div>`;
        popupEl.getElementsByClassName('view')[0].onclick = () => { 
          analytics.event({
            category: 'spotainize_common',
            action: 'map_view_click',
          });
        }
        popupEl.getElementsByClassName('directions')[0].onclick = () => { 
          analytics.event({
            category: 'spotainize_common',
            action: 'map_directions_click',
          });
        }
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setLngLat(lnglat)
        .setDOMContent(popupEl);

        let markerEl = document.createElement('div');
        markerEl.className = `marker${loc.live ? ' live' : ''}`
        markerEl.innerHTML = `<img src="${process.env.PUBLIC_URL}${img}" />`
        newMarkers.push(new mapboxgl.Marker(markerEl)
        .setLngLat(lnglat)
        .setPopup(popup)
        .addTo(mapRef.current));
      }
    }
    if (turfPoints.length > 0) {
      const newCenter = center(featureCollection(turfPoints));
      
      mapRef.current.flyTo({
        center: newCenter.geometry.coordinates,
        speed: 0.5,
        curve: 0,
        essential: true
      });
      const bounds = new mapboxgl.LngLatBounds();
      turfPoints.forEach(function(pt) {
        bounds.extend(pt.geometry.coordinates);
      });
      mapRef.current.fitBounds(bounds, { maxZoom: 15, padding: 100 });
    }
    
    markers.current = newMarkers;
  }, [data, day, time]);

  const wrapperStyle = {
    height: '700px',
    width: '100%'
  };

  return (
    <div className="Fade">
      <div className="contentWrapper">
        <div style={wrapperStyle} ref={mapContainerRef} className='mapContainer'/>
          {mapLoading ?
            <div className="loaderContainer">
              <i className="loader" />
            </div> : null}
      </div>
    </div>
  )
}

export default Map;