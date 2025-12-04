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
} from 'react-native';
import { useLocation, useGeoData } from '../hooks';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type GeoPointScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GeoPoint'>;

interface Props {
  navigation: GeoPointScreenNavigationProp;
}

export function GeoPointScreen({ navigation }: Props) {
  const { coordinate, loading, error, hasPermission, getCurrentLocation, requestPermission } = useLocation();
  const { addGeoPoint } = useGeoData();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCapture = async () => {
    const location = await getCurrentLocation();
    if (location) {
      Alert.alert('Location Captured', 'Your current location has been recorded.');
    }
  };

  const handleSave = () => {
    if (!coordinate) {
      Alert.alert('No Location', 'Please capture your location first.');
      return;
    }

    addGeoPoint(coordinate, name || undefined, description || undefined);
    Alert.alert('Saved', 'GeoPoint has been saved to your collection.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Location permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📍 Capture GeoPoint</Text>
        <Text style={styles.headerSubtitle}>Record a single geographic location</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        ) : coordinate ? (
          <View style={styles.coordinateCard}>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Latitude:</Text>
              <Text style={styles.coordinateValue}>{coordinate.latitude.toFixed(6)}</Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Longitude:</Text>
              <Text style={styles.coordinateValue}>{coordinate.longitude.toFixed(6)}</Text>
            </View>
            {coordinate.altitude !== null && coordinate.altitude !== undefined && (
              <View style={styles.coordinateRow}>
                <Text style={styles.coordinateLabel}>Altitude:</Text>
                <Text style={styles.coordinateValue}>{coordinate.altitude.toFixed(2)} m</Text>
              </View>
            )}
            {coordinate.accuracy !== null && coordinate.accuracy !== undefined && (
              <View style={styles.coordinateRow}>
                <Text style={styles.coordinateLabel}>Accuracy:</Text>
                <Text style={styles.coordinateValue}>±{coordinate.accuracy.toFixed(1)} m</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>No location captured yet</Text>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.captureButton, loading && styles.disabledButton]}
          onPress={handleCapture}
          disabled={loading}
        >
          <Text style={styles.captureButtonText}>
            {loading ? 'Capturing...' : coordinate ? 'Recapture Location' : 'Capture Location'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details (Optional)</Text>
        
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a name for this point"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add a description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, !coordinate && styles.disabledButton]}
          onPress={handleSave}
          disabled={!coordinate}
        >
          <Text style={styles.saveButtonText}>Save GeoPoint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#4CAF50',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  coordinateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#666',
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  noLocationContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noLocationText: {
    color: '#999',
    fontSize: 14,
  },
  errorText: {
    color: '#f44336',
    marginTop: 10,
    textAlign: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
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
  permissionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
