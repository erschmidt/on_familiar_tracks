'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity } from '@/types';
import polyline from 'polyline';

interface RouteMapProps {
  activities: Activity[];
}

export default function RouteMap({ activities }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || activities.length === 0) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add polylines for each activity
    const bounds = L.latLngBounds([]);
    const colors = ['#FC4C02', '#FF6B35', '#FF8C42', '#FFAD5A'];

    activities.forEach((activity, index) => {
      if (activity.map?.summary_polyline) {
        const coordinates = polyline.decode(activity.map.summary_polyline);
        const latLngs = coordinates.map(([lat, lng]) => L.latLng(lat, lng));
        
        const polylineLayer = L.polyline(latLngs, {
          color: colors[index % colors.length],
          weight: 3,
          opacity: 0.7,
        }).addTo(mapRef.current!);

        bounds.extend(latLngs);

        // Add tooltip with activity info
        const date = new Date(activity.start_date).toLocaleDateString();
        polylineLayer.bindPopup(`
          <strong>${activity.name}</strong><br>
          ${date}<br>
          Distance: ${(activity.distance / 1000).toFixed(2)} km<br>
          ${activity.average_heartrate ? `HR: ${Math.round(activity.average_heartrate)} bpm` : ''}
        `);
      }
    });

    // Fit map to bounds
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup is handled by clearing layers above
    };
  }, [activities]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
