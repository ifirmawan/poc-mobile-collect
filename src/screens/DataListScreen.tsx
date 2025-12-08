import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useGeoData } from '../hooks';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { GeoData } from '../types';

type DataListScreenProps = NativeStackScreenProps<RootStackParamList, 'DataList'>;

export function DataListScreen({ navigation, route }: DataListScreenProps) {
  const { collectedData } = useGeoData();
  const filterType = route.params?.filterType || 'all';

  const filteredData = filterType === 'all'
    ? collectedData
    : collectedData.filter(item => item.type === filterType);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'geopoint': return '📍';
      case 'geotrace': return '📏';
      case 'geoshape': return '⬡';
      default: return '📌';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'geopoint': return '#4CAF50';
      case 'geotrace': return '#FF9800';
      case 'geoshape': return '#9C27B0';
      default: return '#2196F3';
    }
  };

  const getItemSubtitle = (item: GeoData) => {
    if (item.type === 'geopoint') {
      return `Lat: ${item.coordinate.latitude.toFixed(6)}, Lng: ${item.coordinate.longitude.toFixed(6)}`;
    } else {
      return `${item.coordinates.length} points`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTitle = () => {
    switch (filterType) {
      case 'geopoint': return 'GeoPoints';
      case 'geotrace': return 'GeoTraces';
      case 'geoshape': return 'GeoShapes';
      default: return 'All Data';
    }
  };

  const renderItem = ({ item }: { item: GeoData }) => (
    <TouchableOpacity
      style={[styles.itemCard, { borderLeftColor: getItemColor(item.type) }]}
      onPress={() => navigation.navigate('MapView', { item })}
    >
      <Text style={styles.itemIcon}>{getItemIcon(item.type)}</Text>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name || `Unnamed ${item.type}`}</Text>
        <Text style={styles.itemSubtitle}>{getItemSubtitle(item)}</Text>
        <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const getPluralName = (type: string) => {
    switch (type) {
      case 'geopoint': return 'GeoPoints';
      case 'geotrace': return 'GeoTraces';
      case 'geoshape': return 'GeoShapes';
      default: return 'geo data';
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>No data collected yet</Text>
      <Text style={styles.emptySubtext}>
        Go back and capture some {filterType === 'all' ? 'geo data' : getPluralName(filterType)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: filterType === 'all' ? '#2196F3' : getItemColor(filterType) }]}>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <Text style={styles.headerSubtitle}>{filteredData.length} item(s)</Text>
      </View>
      
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={filteredData.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
