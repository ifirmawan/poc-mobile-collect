import type { GeoData } from '../types';

export type RootStackParamList = {
  Home: undefined;
  GeoPoint: undefined;
  GeoTrace: undefined;
  GeoShape: undefined;
  DataList: { filterType?: 'geopoint' | 'geotrace' | 'geoshape' | 'all' };
  MapView: { item: GeoData };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
