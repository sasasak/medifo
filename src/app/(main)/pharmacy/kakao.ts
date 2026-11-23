// 카카오 지도 SDK 중 이 프로젝트에서 실제로 쓰는 부분만 선언함 (타입 패키지 없이 직접 관리)

// keywordSearch 콜백이 받는 검색 상태 값. 코드에서는 OK, ZERO_RESULT와 비교함
export type KakaoSearchStatus = 'OK' | 'ZERO_RESULT' | 'ERROR';

// keywordSearch 정렬 기준 값
export type KakaoSortBy = 'accuracy' | 'distance';

// keywordSearch 결과 중 사용하는 필드
export interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  phone: string;
  distance: string;
  x: string;
  y: string;
}

// addressSearch 결과 중 사용하는 필드
export interface KakaoAddress {
  x: string;
  y: string;
}

// 내부 구조를 쓰지 않고 SDK에 다시 넘기기만 하는 객체
export type KakaoLatLng = object;
export type KakaoSize = object;
export type KakaoMarkerImage = object;

export interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void;
}

export interface KakaoMarker {
  setMap(map: KakaoMapInstance | null): void;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMapInstance | null): void;
}

export interface KakaoPlaces {
  keywordSearch(
    keyword: string,
    callback: (data: KakaoPlace[], status: KakaoSearchStatus) => void,
    options?: {
      location?: KakaoLatLng;
      radius?: number;
      category_group_code?: string;
      sort?: KakaoSortBy;
    },
  ): void;
}

export interface KakaoGeocoder {
  addressSearch(
    query: string,
    callback: (result: KakaoAddress[], status: KakaoSearchStatus) => void,
  ): void;
}

interface KakaoMaps {
  load(callback: () => void): void;
  // 검색 결과의 문자열 좌표(x, y)도 그대로 넘기고 있어 string도 받음
  LatLng: new (lat: number | string, lng: number | string) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  Marker: new (options: {
    map: KakaoMapInstance | null;
    position: KakaoLatLng;
    zIndex?: number;
    image?: KakaoMarkerImage;
  }) => KakaoMarker;
  CustomOverlay: new (options: {
    map: KakaoMapInstance | null;
    position: KakaoLatLng;
    content: string;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlay;
  Size: new (width: number, height: number) => KakaoSize;
  MarkerImage: new (src: string, size: KakaoSize) => KakaoMarkerImage;
  services: {
    Places: new () => KakaoPlaces;
    Geocoder: new () => KakaoGeocoder;
    Status: { OK: 'OK'; ZERO_RESULT: 'ZERO_RESULT' };
    SortBy: { DISTANCE: 'distance' };
  };
}

declare global {
  interface Window {
    kakao: { maps: KakaoMaps };
  }
}
