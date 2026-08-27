'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  searchQuery: string;
  selectedPlace: { name: string; x: string; y: string } | null;
  onPharmaciesFound: (pharmacies: any[]) => void;
}

export default function KakaoMap({
  searchQuery,
  selectedPlace,
  onPharmaciesFound,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const searchPharmacy = (latitude: number, longitude: number) => {
    if (!mapInstanceRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      '약국',
      (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          clearMarkers();
          data.forEach((place: any) => {
            const marker = new window.kakao.maps.Marker({
              map: mapInstanceRef.current,
              position: new window.kakao.maps.LatLng(place.y, place.x),
            });
            markersRef.current.push(marker);
          });
          onPharmaciesFound(data);
        }
      },
      {
        location: new window.kakao.maps.LatLng(latitude, longitude),
        radius: 1000,
      },
    );
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        window.dispatchEvent(new Event('kakaoLoaded'));
        if (!mapRef.current) return;

        const initMap = (latitude: number, longitude: number) => {
          const options = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };
          mapInstanceRef.current = new window.kakao.maps.Map(
            mapRef.current,
            options,
          );
          searchPharmacy(latitude, longitude);
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            initMap(latitude, longitude);
          },
          () => {
            initMap(37.5665, 126.978);
          },
        );
      });
    };
  }, []);

  // selectedPlace 변경 시 지도 이동 및 약국 검색
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current) return;

    const newCenter = new window.kakao.maps.LatLng(
      selectedPlace.y,
      selectedPlace.x,
    );
    mapInstanceRef.current.setCenter(newCenter);
    searchPharmacy(Number(selectedPlace.y), Number(selectedPlace.x));
  }, [selectedPlace]);

  // searchQuery 변경 시 지역 검색
  useEffect(() => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchQuery + ' 약국', (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const firstPlace = data[0];
        const newCenter = new window.kakao.maps.LatLng(
          firstPlace.y,
          firstPlace.x,
        );
        mapInstanceRef.current.setCenter(newCenter);
        searchPharmacy(Number(firstPlace.y), Number(firstPlace.x));
      }
    });
  }, [searchQuery]);

  return <div ref={mapRef} className="h-80 w-full rounded-2xl" />;
}
