import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useGeoData } from '../hooks';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export function HomeScreen({ navigation }: Props) {
  const { collectedData, isSubmitting, submitData, clearAll, error, lastSubmissionId } = useGeoData();

  const handleSubmit = async () => {
    if (collectedData.length === 0) {
      Alert.alert('No Data', 'Please collect some geo data before submitting.');
      return;
    }

    const success = await submitData();
    if (success) {
      Alert.alert('Success', 'Data submitted successfully!');
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleClear = () => {
    if (collectedData.length === 0) return;
    
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all collected data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAll },
      ]
    );
  };

  const getDataCountByType = (type: string) => {
    return collectedData.filter(item => item.type === type).length;
  };

  const handleStatCardPress = (filterType: 'all' | 'geopoint' | 'geotrace' | 'geoshape') => {
    navigation.navigate('DataList', { filterType });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>POC Mobile Collect</Text>
        <Text style={styles.subtitle}>Capture geo data for remote collection</Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => handleStatCardPress('all')}
        >
          <Text style={styles.statNumber}>{collectedData.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => handleStatCardPress('geopoint')}
        >
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{getDataCountByType('geopoint')}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => handleStatCardPress('geotrace')}
        >
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{getDataCountByType('geotrace')}</Text>
          <Text style={styles.statLabel}>Traces</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => handleStatCardPress('geoshape')}
        >
          <Text style={[styles.statNumber, { color: '#9C27B0' }]}>{getDataCountByType('geoshape')}</Text>
          <Text style={styles.statLabel}>Shapes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.captureSection}>
        <Text style={styles.sectionTitle}>Capture Data</Text>
        
        <TouchableOpacity
          style={[styles.captureButton, styles.geoPointButton]}
          onPress={() => navigation.navigate('GeoPoint')}
        >
          <Text style={styles.buttonIcon}>📍</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>GeoPoint</Text>
            <Text style={styles.buttonDescription}>Capture a single location</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, styles.geoTraceButton]}
          onPress={() => navigation.navigate('GeoTrace')}
        >
          <Text style={styles.buttonIcon}>📏</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>GeoTrace</Text>
            <Text style={styles.buttonDescription}>Track a path or line</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, styles.geoShapeButton]}
          onPress={() => navigation.navigate('GeoShape')}
        >
          <Text style={styles.buttonIcon}>⬡</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>GeoShape</Text>
            <Text style={styles.buttonDescription}>Define an area or polygon</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting || collectedData.length === 0}
        >
          <Text style={styles.actionButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton, collectedData.length === 0 && styles.disabledButton]}
          onPress={handleClear}
          disabled={collectedData.length === 0}
        >
          <Text style={styles.actionButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {lastSubmissionId && (
        <View style={styles.lastSubmission}>
          <Text style={styles.lastSubmissionText}>
            Last submission ID: {lastSubmissionId}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  captureSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  geoPointButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  geoTraceButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  geoShapeButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionSection: {
    padding: 16,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastSubmission: {
    padding: 16,
    alignItems: 'center',
  },
  lastSubmissionText: {
    fontSize: 12,
    color: '#666',
  },
});
