'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  searchQuery: string;
}

export default function KakaoMap({ searchQuery }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // 지도 초기화 (최초 1번)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
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

          new window.kakao.maps.Marker({
            map: mapInstanceRef.current,
            position: new window.kakao.maps.LatLng(latitude, longitude),
          });

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

  // 약국 검색 함수
  const searchPharmacy = (latitude: number, longitude: number) => {
    if (!mapInstanceRef.current) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      '약국',
      (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          data.forEach((place: any) => {
            new window.kakao.maps.Marker({
              map: mapInstanceRef.current,
              position: new window.kakao.maps.LatLng(place.y, place.x),
            });
          });
        }
      },
      {
        location: new window.kakao.maps.LatLng(latitude, longitude),
        radius: 1000,
      },
    );
  };

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
        searchPharmacy(firstPlace.y, firstPlace.x);
      }
    });
  }, [searchQuery]);

  return <div ref={mapRef} className="h-80 w-full rounded-2xl" />;
}
