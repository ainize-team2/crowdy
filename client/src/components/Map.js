import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { point, center, featureCollection, distance } from '@turf/turf';
import getInfoFromNowStatus from '../getInfoFromNowStatus';
import { debounce } from 'lodash';

import '../styles/map.css';

const DEFAULT_COORDS_LAT = 37.5866022;
const DEFAULT_COORDS_LNG = 126.972618;

export const Map = ({
  data,
  day,
  time,
  userGps,
  mapCoords,
  loading,
  setLoading,
  handleMapCoordsChange,
}) => {
  const initialZoom = 15;
  const markers = useRef([]);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const gpsRef = useRef(userGps);

  const moveEndHandler = (event) => {
    const coords = mapRef.current.getCenter();
    mapCoords.current = { lat: coords.lat.toFixed(6), lng: coords.lng.toFixed(6) };
    if (!event.originalEvent) {
      // ignore moveend events triggered by 'flyTo' or 'fitBounds'
      return;
    } else {
      handleMapCoordsChange();
    }
  }

  const debounceMoveEndHandler = debounce(moveEndHandler, 3000, { leading: false, trailing: true });

  const setUpMap = () => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: {
        "version": 8,
        "sources": {
          "raster-tiles": {
            "type": "raster",
            "tiles": [
              // "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
              "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
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
      center: [gpsRef.current.longitude, gpsRef.current.latitude],
      zoom: initialZoom
    });
    const map = mapRef.current;
    const coords = map.getCenter();
    mapCoords.current = { lat: coords.lat.toFixed(6), lng: coords.lng.toFixed(6) };
    map.on('load', () => {
      if (loading) {
        setLoading(false);
      }
    });
    
    map.on('moveend', debounceMoveEndHandler);

    handleMapCoordsChange();
  }

  const handleNoUserGps = () => {
    if (!mapRef.current && (!gpsRef || !gpsRef.latitude || !gpsRef.longitude)) {
      console.log("handling no user gps");
      gpsRef.current = { latitude: DEFAULT_COORDS_LAT, longitude: DEFAULT_COORDS_LNG };
      setUpMap();
    }
  }

  useEffect(() => {
    // If userGps isn't set in 5 sec, call handleNoUserGps() once
    setTimeout(handleNoUserGps, 5000);
  }, []);

  useEffect(() => {
    if (!userGps.latitude || !userGps.longitude || mapRef.current || !mapContainerRef.current) {
      return;
    }
    gpsRef.current = userGps;
    setUpMap();
  }, [userGps]);

  useEffect(() => {
    if (!mapRef.current || !mapContainerRef) return;
    markers.current.forEach(marker => {
      marker.remove();
    });
    const fromPoint = userGps.longitude && userGps.latitude ? point([ userGps.longitude, userGps.latitude ]) : null;
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
            <div>${loc.distance} km</div>
            <div>${loc.address}</div>
          </div>
          <div class="bottom">
            <a href=${encodeURI(loc.link)}>VIEW</a>
            <a href=${encodeURI(loc.directions)}>DIRECTIONS</a>
          </div>`;
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
    height: '500px'
  };

  return (
    <div className="Fade">
      <div className="contentWrapper">
        <div style={wrapperStyle} ref={mapContainerRef} className='mapContainer'/>
      </div>
    </div>
  )
}

export default Map;