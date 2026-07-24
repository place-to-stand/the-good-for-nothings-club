'use client'

import {
  APIProvider,
  Map as ReactGoogleMap,
  Marker,
} from '@vis.gl/react-google-maps'

import { clubhouse } from '../data/location'

export default function Map() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <ReactGoogleMap
        defaultCenter={clubhouse.geo}
        defaultZoom={15}
        streetViewControl={false}
        mapTypeControl={false}
        zoomControl={false}
        fullscreenControl={false}
      >
        <Marker position={clubhouse.geo} />
      </ReactGoogleMap>
    </APIProvider>
  )
}
