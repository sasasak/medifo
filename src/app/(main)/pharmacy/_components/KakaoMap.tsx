'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import type {
  KakaoAddress,
  KakaoCustomOverlay,
  KakaoMapInstance,
  KakaoMarker,
  KakaoPlace,
  KakaoSearchStatus,
} from '../kakao';
import type { MapTarget, Pharmacy, SelectedPlace } from '../types';

// 지역 검색 반경 단계(m). 결과가 MIN_REGION_RESULTS건 미만이면 다음 반경으로 넓힘
const REGION_RADIUS_STEPS = [1000, 3000, 5000];
const MIN_REGION_RESULTS = 3;

interface KakaoMapProps {
  mapTarget: MapTarget;
  onPharmaciesFound: (pharmacies: Pharmacy[]) => void;
}

export default function KakaoMap({
  mapTarget,
  onPharmaciesFound,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<(KakaoMarker | KakaoCustomOverlay)[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const searchNearbyPharmacy = useEffectEvent(
    (place: SelectedPlace, isStale: () => boolean) => {
      if (!mapInstanceRef.current) return;

      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(
        '약국',
        (data: KakaoPlace[], status: KakaoSearchStatus) => {
          if (isStale()) return;
          if (status === window.kakao.maps.services.Status.OK) {
            clearMarkers();

            const selectedPosition = new window.kakao.maps.LatLng(
              place.y,
              place.x,
            );
            const selectedMarker = new window.kakao.maps.Marker({
              map: mapInstanceRef.current,
              position: selectedPosition,
              zIndex: 10,
            });
            markersRef.current.push(selectedMarker);

            const selectedOverlay = new window.kakao.maps.CustomOverlay({
              map: mapInstanceRef.current,
              position: selectedPosition,
              content: `<div style="background: #1d9e75; border-radius: 8px; padding: 2px 8px; font-size: 12px; white-space: nowrap; color: white; font-weight: bold; pointer-events: none; position: relative; z-index: -1;">${place.place_name}</div>`,
              yAnchor: 2.5,
              zIndex: 10,
            });
            markersRef.current.push(selectedOverlay);

            const smallMarkerSize = new window.kakao.maps.Size(16, 24);
            const smallMarkerImage = new window.kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png',
              smallMarkerSize,
            );

            const nearby = data.filter((p) => p.id !== place.id).slice(0, 3);

            nearby.forEach((nearbyPlace) => {
              const position = new window.kakao.maps.LatLng(
                nearbyPlace.y,
                nearbyPlace.x,
              );
              const marker = new window.kakao.maps.Marker({
                map: mapInstanceRef.current,
                position,
                image: smallMarkerImage,
              });
              markersRef.current.push(marker);

              const overlay = new window.kakao.maps.CustomOverlay({
                map: mapInstanceRef.current,
                position,
                content: `<div style="background: white; border: 1px solid #1d9e75; border-radius: 8px; padding: 2px 8px; font-size: 11px; white-space: nowrap; color: #04342c; pointer-events: none; position: relative; z-index: -1;">${nearbyPlace.place_name}</div>`,
                yAnchor: 2.5,
              });
              markersRef.current.push(overlay);
            });

            onPharmaciesFound([
              {
                id: place.id,
                place_name: place.place_name,
                address_name: place.address_name,
                phone: place.phone,
                distance: '',
                x: place.x,
                y: place.y,
              },
              ...nearby.map((p) => ({
                id: p.id,
                place_name: p.place_name,
                address_name: p.address_name,
                phone: p.phone,
                distance: p.distance,
                x: p.x,
                y: p.y,
              })),
            ]);
          }
        },
        {
          location: new window.kakao.maps.LatLng(place.y, place.x),
          radius: 1000,
        },
      );
    },
  );

  const searchPharmacy = useEffectEvent(
    (latitude: number, longitude: number, isStale: () => boolean) => {
      if (!mapInstanceRef.current) return;

      const ps = new window.kakao.maps.services.Places();
      const location = new window.kakao.maps.LatLng(latitude, longitude);

      const searchWithin = (stepIndex: number) => {
        ps.keywordSearch(
          '약국',
          (data: KakaoPlace[], status: KakaoSearchStatus) => {
            if (isStale()) return;

            const { OK, ZERO_RESULT } = window.kakao.maps.services.Status;
            const count = status === OK ? data.length : 0;
            const isLastStep = stepIndex === REGION_RADIUS_STEPS.length - 1;
            if (
              (status === OK || status === ZERO_RESULT) &&
              count < MIN_REGION_RESULTS &&
              !isLastStep
            ) {
              searchWithin(stepIndex + 1);
              return;
            }

            if (status === OK) {
              clearMarkers();
              data.forEach((place) => {
                const position = new window.kakao.maps.LatLng(place.y, place.x);
                const marker = new window.kakao.maps.Marker({
                  map: mapInstanceRef.current,
                  position,
                });
                markersRef.current.push(marker);

                const overlay = new window.kakao.maps.CustomOverlay({
                  map: mapInstanceRef.current,
                  position,
                  content: `<div style="background: white; border: 1px solid #1d9e75; border-radius: 8px; padding: 2px 8px; font-size: 12px; white-space: nowrap; color: #04342c; pointer-events: none; position: relative; z-index: -1;">${place.place_name}</div>`,
                  yAnchor: 2.5,
                });
                markersRef.current.push(overlay);
              });
              onPharmaciesFound(data);
            }
          },
          {
            location,
            radius: REGION_RADIUS_STEPS[stepIndex],
            sort: window.kakao.maps.services.SortBy.DISTANCE,
          },
        );
      };

      searchWithin(0);
    },
  );

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
            mapRef.current!,
            options,
          );
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

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    let ignore = false;
    const isStale = () => ignore;

    if (mapTarget.mode === 'pharmacy') {
      const { place } = mapTarget;
      const newCenter = new window.kakao.maps.LatLng(place.y, place.x);
      mapInstanceRef.current.setCenter(newCenter);
      searchNearbyPharmacy(place, isStale);
    } else if (mapTarget.mode === 'region' && mapTarget.query.trim()) {
      const { query } = mapTarget;

      const moveAndSearch = (y: string, x: string) => {
        const newCenter = new window.kakao.maps.LatLng(y, x);
        mapInstanceRef.current!.setCenter(newCenter);
        searchPharmacy(Number(y), Number(x), isStale);
      };

      // 지역명은 주소 검색 결과의 중심 좌표를 쓰고, 주소 결과가 없으면(약국 이름, 역 이름 등) 키워드 검색 첫 결과를 씀
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(
        query,
        (result: KakaoAddress[], status: KakaoSearchStatus) => {
          if (isStale()) return;
          if (status === window.kakao.maps.services.Status.OK) {
            moveAndSearch(result[0].y, result[0].x);
            return;
          }

          const ps = new window.kakao.maps.services.Places();
          ps.keywordSearch(
            query + ' 약국',
            (data: KakaoPlace[], status: KakaoSearchStatus) => {
              if (isStale()) return;
              if (status === window.kakao.maps.services.Status.OK) {
                moveAndSearch(data[0].y, data[0].x);
              }
            },
          );
        },
      );
    }

    return () => {
      ignore = true;
    };
  }, [mapTarget]);

  return <div ref={mapRef} className="h-80 w-full rounded-2xl" />;
}
