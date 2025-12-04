import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import LeafletMapView from '../components/LeafletMapView';

type MapViewScreenProps = NativeStackScreenProps<RootStackParamList, 'MapView'>;

export function MapViewScreen({ route }: MapViewScreenProps) {
  const { item } = route.params;

  const getHeaderColor = () => {
    switch (item.type) {
      case 'geopoint': return '#4CAF50';
      case 'geotrace': return '#FF9800';
      case 'geoshape': return '#9C27B0';
      default: return '#2196F3';
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'geopoint': return '📍';
      case 'geotrace': return '📏';
      case 'geoshape': return '⬡';
      default: return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getCoordinateInfo = () => {
    if (item.type === 'geopoint') {
      return `Lat: ${item.coordinate.latitude.toFixed(6)}, Lng: ${item.coordinate.longitude.toFixed(6)}`;
    } else {
      return `${item.coordinates.length} coordinates`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: getHeaderColor() }]}>
        <Text style={styles.headerIcon}>{getIcon()}</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{item.name || `Unnamed ${item.type}`}</Text>
          <Text style={styles.headerSubtitle}>{getCoordinateInfo()}</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <LeafletMapView
          type={item.type}
          coordinate={'coordinate' in item ? item.coordinate : undefined}
          coordinates={'coordinates' in item ? item.coordinates : undefined}
          name={item.name}
        />
      </View>

      <ScrollView style={styles.detailsContainer}>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>

        {item.description && (
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{item.description}</Text>
          </View>
        )}

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Created At</Text>
          <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>ID</Text>
          <Text style={[styles.detailValue, styles.idText]}>{item.id}</Text>
        </View>

        {item.type === 'geopoint' && (
          <>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Latitude</Text>
              <Text style={styles.detailValue}>{item.coordinate.latitude.toFixed(8)}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Longitude</Text>
              <Text style={styles.detailValue}>{item.coordinate.longitude.toFixed(8)}</Text>
            </View>
            {item.coordinate.altitude !== null && item.coordinate.altitude !== undefined && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Altitude</Text>
                <Text style={styles.detailValue}>{item.coordinate.altitude.toFixed(2)} m</Text>
              </View>
            )}
            {item.coordinate.accuracy !== null && item.coordinate.accuracy !== undefined && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Accuracy</Text>
                <Text style={styles.detailValue}>±{item.coordinate.accuracy.toFixed(1)} m</Text>
              </View>
            )}
          </>
        )}

        {(item.type === 'geotrace' || item.type === 'geoshape') && (
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Coordinates</Text>
            <Text style={styles.detailValue}>{item.coordinates.length} points</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  idText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
