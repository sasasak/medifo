export interface SelectedPlace {
  id: string;
  name: string;
  x: string;
  y: string;
  place_name: string;
  address_name: string;
  phone: string;
}

export type MapTarget =
  | { mode: 'region'; query: string }
  | { mode: 'pharmacy'; place: SelectedPlace }
  | { mode: 'idle' };

export interface Pharmacy {
  id: string;
  place_name: string;
  address_name: string;
  phone: string;
  distance: string;
  x: string;
  y: string;
}
