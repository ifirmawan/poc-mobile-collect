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

type GeoTraceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GeoTrace'>;

interface Props {
  navigation: GeoTraceScreenNavigationProp;
}

export function GeoTraceScreen({ navigation }: Props) {
  const { coordinates, isTracking, error, startTracking, stopTracking, clearCoordinates } = useLocationTracking();
  const { addGeoTrace } = useGeoData();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleStartTracking = async () => {
    await startTracking();
  };

  const handleStopTracking = () => {
    stopTracking();
    Alert.alert('Tracking Stopped', `Recorded ${coordinates.length} points.`);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Trace',
      'Are you sure you want to clear all recorded points?',
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
    if (coordinates.length < 2) {
      Alert.alert('Not Enough Points', 'A trace needs at least 2 points. Keep tracking to add more points.');
      return;
    }

    addGeoTrace(coordinates, name || undefined, description || undefined);
    Alert.alert('Saved', 'GeoTrace has been saved to your collection.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const calculateDistance = (coords: Coordinate[]): number => {
    let totalDistance = 0;
    for (let i = 1; i < coords.length; i++) {
      const lat1 = coords[i - 1].latitude;
      const lon1 = coords[i - 1].longitude;
      const lat2 = coords[i].latitude;
      const lon2 = coords[i].longitude;

      // Haversine formula
      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }
    return totalDistance;
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
        <Text style={styles.headerTitle}>📏 Record GeoTrace</Text>
        <Text style={styles.headerSubtitle}>Track a path or line</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{coordinates.length}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatDistance(calculateDistance(coordinates))}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={[styles.statusIndicator, isTracking && styles.statusActive]}>
          <Text style={styles.statusText}>{isTracking ? 'TRACKING' : 'STOPPED'}</Text>
        </View>
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
            <Text style={styles.controlButtonText}>▶ Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStopTracking}
          >
            <Text style={styles.controlButtonText}>⏹ Stop Tracking</Text>
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
          <ActivityIndicator size="small" color="#FF9800" />
          <Text style={styles.trackingText}>Recording your path...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details (Optional)</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter a name for this trace"
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
        <Text style={styles.sectionTitle}>Recorded Points</Text>
        {coordinates.length > 0 ? (
          <FlatList
            data={coordinates}
            renderItem={renderCoordinate}
            keyExtractor={(_, index) => index.toString()}
            style={styles.coordinatesList}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <Text style={styles.noDataText}>No points recorded yet. Start tracking to capture your path.</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, (coordinates.length < 2 || isTracking) && styles.disabledButton]}
          onPress={handleSave}
          disabled={coordinates.length < 2 || isTracking}
        >
          <Text style={styles.saveButtonText}>Save GeoTrace</Text>
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
    backgroundColor: '#FF9800',
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
    alignItems: 'center',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#fff3e0',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  trackingText: {
    marginLeft: 10,
    color: '#FF9800',
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
    maxHeight: 150,
  },
  coordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  coordinateIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF9800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 12,
  },
  coordinateDetails: {
    flex: 1,
  },
  coordinateText: {
    fontSize: 12,
    color: '#333',
  },
  accuracyText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  actions: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#FF9800',
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
