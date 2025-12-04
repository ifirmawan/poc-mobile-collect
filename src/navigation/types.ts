export type RootStackParamList = {
  Home: undefined;
  GeoPoint: undefined;
  GeoTrace: undefined;
  GeoShape: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
