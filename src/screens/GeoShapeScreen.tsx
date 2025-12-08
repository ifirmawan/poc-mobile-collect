import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocationTracking, useGeoData } from '../hooks';
import type { Coordinate } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type GeoShapeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GeoShape'>;

interface Props {
  navigation: GeoShapeScreenNavigationProp;
}

export function GeoShapeScreen({ navigation }: Props) {
  const { coordinates, isTracking, error, startTracking, stopTracking, clearCoordinates } = useLocationTracking();
  const { addGeoShape } = useGeoData();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleStartTracking = async () => {
    await startTracking();
  };

  const handleStopTracking = () => {
    stopTracking();
    Alert.alert('Tracking Stopped', `Recorded ${coordinates.length} vertices.`);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Shape',
      'Are you sure you want to clear all recorded vertices?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCoordinates,
        },
      ]
    );
  };

  const handleSave = () => {
    if (coordinates.length < 3) {
      Alert.alert('Not Enough Points', 'A shape needs at least 3 vertices to form a polygon. Keep tracking to add more points.');
      return;
    }

    // Close the polygon by adding the first point at the end if not already closed
    const closedCoordinates = [...coordinates];
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
      closedCoordinates.push(first);
    }

    addGeoShape(closedCoordinates, name || undefined, description || undefined);
    Alert.alert('Saved', 'GeoShape has been saved to your collection.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const calculateArea = (coords: Coordinate[]): number => {
    if (coords.length < 3) return 0;

    // Shoelace formula for polygon area (approximate)
    let area = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      // Convert to approximate meters (rough calculation)
      const x1 = coords[i].longitude * 111320 * Math.cos(coords[i].latitude * Math.PI / 180);
      const y1 = coords[i].latitude * 110540;
      const x2 = coords[j].longitude * 111320 * Math.cos(coords[j].latitude * Math.PI / 180);
      const y2 = coords[j].latitude * 110540;
      
      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area / 2);
  };

  const formatArea = (sqMeters: number): string => {
    if (sqMeters < 10000) {
      return `${sqMeters.toFixed(1)} m²`;
    } else if (sqMeters < 1000000) {
      return `${(sqMeters / 10000).toFixed(2)} ha`;
    }
    return `${(sqMeters / 1000000).toFixed(2)} km²`;
  };

  const calculatePerimeter = (coords: Coordinate[]): number => {
    let perimeter = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const lat1 = coords[i].latitude;
      const lon1 = coords[i].longitude;
      const lat2 = coords[j].latitude;
      const lon2 = coords[j].longitude;

      const R = 6371000;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      perimeter += R * c;
    }
    return perimeter;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const renderCoordinate = ({ item, index }: { item: Coordinate; index: number }) => (
    <View style={styles.coordinateItem}>
      <Text style={styles.coordinateIndex}>{index + 1}</Text>
      <View style={styles.coordinateDetails}>
        <Text style={styles.coordinateText}>
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
        {item.accuracy && (
          <Text style={styles.accuracyText}>Accuracy: ±{item.accuracy.toFixed(1)}m</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⬡ Record GeoShape</Text>
        <Text style={styles.headerSubtitle}>Define an area or polygon</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{coordinates.length}</Text>
          <Text style={styles.statLabel}>Vertices</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatArea(calculateArea(coordinates))}</Text>
          <Text style={styles.statLabel}>Area</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatDistance(calculatePerimeter(coordinates))}</Text>
          <Text style={styles.statLabel}>Perimeter</Text>
        </View>
      </View>

      <View style={[styles.statusIndicator, isTracking && styles.statusActive]}>
        <Text style={styles.statusText}>{isTracking ? '● RECORDING BOUNDARY' : 'READY'}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        {!isTracking ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartTracking}
          >
            <Text style={styles.controlButtonText}>▶ Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStopTracking}
          >
            <Text style={styles.controlButtonText}>⏹ Stop Recording</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.clearButton, (coordinates.length === 0 || isTracking) && styles.disabledButton]}
          onPress={handleClear}
          disabled={coordinates.length === 0 || isTracking}
        >
          <Text style={styles.controlButtonText}>🗑 Clear</Text>
        </TouchableOpacity>
      </View>

      {isTracking && (
        <View style={styles.trackingIndicator}>
          <ActivityIndicator size="small" color="#9C27B0" />
          <Text style={styles.trackingText}>Recording boundary vertices...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details (Optional)</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter a name for this shape"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add a description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.coordinatesSection}>
        <Text style={styles.sectionTitle}>Boundary Vertices</Text>
        {coordinates.length > 0 ? (
          <FlatList
            data={coordinates}
            renderItem={renderCoordinate}
            keyExtractor={(_, index) => index.toString()}
            style={styles.coordinatesList}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <Text style={styles.noDataText}>No vertices recorded yet. Walk around the boundary of the area you want to map.</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, (coordinates.length < 3 || isTracking) && styles.disabledButton]}
          onPress={handleSave}
          disabled={coordinates.length < 3 || isTracking}
        >
          <Text style={styles.saveButtonText}>Save GeoShape</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            if (isTracking) stopTracking();
            navigation.goBack();
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9C27B0',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statusActive: {
    backgroundColor: '#9C27B0',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  clearButton: {
    backgroundColor: '#9e9e9e',
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f3e5f5',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  trackingText: {
    marginLeft: 10,
    color: '#9C27B0',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  coordinatesSection: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coordinatesList: {
    maxHeight: 120,
  },
  coordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  coordinateIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 10,
  },
  coordinateDetails: {
    flex: 1,
  },
  coordinateText: {
    fontSize: 11,
    color: '#333',
  },
  accuracyText: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontSize: 12,
  },
  actions: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
