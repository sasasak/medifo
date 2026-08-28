'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface SelectedPlace {
  id: string;
  name: string;
  x: string;
  y: string;
  place_name: string;
  address_name: string;
  phone: string;
}

interface KakaoMapProps {
  confirmedQuery: string;
  selectedPlace: SelectedPlace | null;
  onPharmaciesFound: (pharmacies: any[]) => void;
}

export default function KakaoMap({
  confirmedQuery,
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

  // 지역 검색 시 - 반경 내 약국 전체 표시
  const searchPharmacy = (latitude: number, longitude: number) => {
    if (!mapInstanceRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      '약국',
      (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          clearMarkers();
          data.forEach((place: any) => {
            const position = new window.kakao.maps.LatLng(place.y, place.x);
            const marker = new window.kakao.maps.Marker({
              map: mapInstanceRef.current,
              position,
            });
            markersRef.current.push(marker);

            const overlay = new window.kakao.maps.CustomOverlay({
              map: mapInstanceRef.current,
              position,
              content: `<div style="background: white; border: 1px solid #1d9e75; border-radius: 8px; padding: 2px 8px; font-size: 12px; white-space: nowrap; color: #04342c;">${place.place_name}</div>`,
              yAnchor: 2.5,
            });
            markersRef.current.push(overlay);
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

  // 약국 직접 선택 시 - 선택한 약국 + 주변 3개
  const searchNearbyPharmacy = (selectedPlace: SelectedPlace) => {
    if (!mapInstanceRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      '약국',
      (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          clearMarkers();

          // 선택한 약국 마커 (기본 크기)
          const selectedPosition = new window.kakao.maps.LatLng(
            selectedPlace.y,
            selectedPlace.x,
          );
          const selectedMarker = new window.kakao.maps.Marker({
            map: mapInstanceRef.current,
            position: selectedPosition,
          });
          markersRef.current.push(selectedMarker);

          const selectedOverlay = new window.kakao.maps.CustomOverlay({
            map: mapInstanceRef.current,
            position: selectedPosition,
            content: `<div style="background: #1d9e75; border-radius: 8px; padding: 2px 8px; font-size: 12px; white-space: nowrap; color: white; font-weight: bold;">${selectedPlace.place_name}</div>`,
            yAnchor: 2.5,
          });
          markersRef.current.push(selectedOverlay);

          // 주변 약국 3개 마커 (작은 크기)
          const smallMarkerSize = new window.kakao.maps.Size(16, 24);
          const smallMarkerImage = new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png',
            smallMarkerSize,
          );

          const nearby = data
            .filter((p: any) => p.id !== selectedPlace.id)
            .slice(0, 3);

          nearby.forEach((place: any) => {
            const position = new window.kakao.maps.LatLng(place.y, place.x);
            const marker = new window.kakao.maps.Marker({
              map: mapInstanceRef.current,
              position,
              image: smallMarkerImage,
            });
            markersRef.current.push(marker);

            const overlay = new window.kakao.maps.CustomOverlay({
              map: mapInstanceRef.current,
              position,
              content: `<div style="background: white; border: 1px solid #1d9e75; border-radius: 8px; padding: 2px 8px; font-size: 11px; white-space: nowrap; color: #04342c;">${place.place_name}</div>`,
              yAnchor: 2.5,
            });
            markersRef.current.push(overlay);
          });

          // 선택한 약국 + 주변 3개 리스트
          onPharmaciesFound([
            {
              id: selectedPlace.id,
              place_name: selectedPlace.place_name,
              address_name: selectedPlace.address_name,
              phone: selectedPlace.phone,
              distance: '',
            },
            ...nearby.map((p: any) => ({
              id: p.id,
              place_name: p.place_name,
              address_name: p.address_name,
              phone: p.phone,
              distance: p.distance,
            })),
          ]);
        }
      },
      {
        location: new window.kakao.maps.LatLng(
          selectedPlace.y,
          selectedPlace.x,
        ),
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
          // 초기에는 약국 검색 안 함
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

  // 약국 직접 선택 시
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current) return;

    const newCenter = new window.kakao.maps.LatLng(
      selectedPlace.y,
      selectedPlace.x,
    );
    mapInstanceRef.current.setCenter(newCenter);
    searchNearbyPharmacy(selectedPlace);
  }, [selectedPlace]);

  // 지역 검색 시
  useEffect(() => {
    if (!confirmedQuery.trim() || !mapInstanceRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(confirmedQuery + ' 약국', (data: any, status: any) => {
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
  }, [confirmedQuery]);

  return <div ref={mapRef} className="h-80 w-full rounded-2xl" />;
}
