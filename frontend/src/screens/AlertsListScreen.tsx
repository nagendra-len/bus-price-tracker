import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api';
import { setAlerts } from '../store';
import { PriceAlert } from '../types';

interface AlertItem {
  id: number;
  source_city: string;
  destination_city: string;
  target_price: number;
  is_active: boolean;
}

const AlertsListScreen = ({ navigation, route }: any) => {
  const [loading, setLoading] = useState(true);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertItem[]>([]);
  const dispatch = useDispatch();
  const alerts = useSelector((state: any) => state.alerts.items);
  const [appliedFilters, setAppliedFilters] = useState<Partial<PriceAlert> | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (route.params?.filters) {
      setAppliedFilters(route.params.filters);
      applyFilters(alerts, route.params.filters);
    } else {
      setFilteredAlerts(alerts);
    }
  }, [alerts, route.params?.filters]);

  const applyFilters = (alertsList: AlertItem[], filters: Partial<PriceAlert>) => {
    let filtered = alertsList;

    if (filters.busType) {
      filtered = filtered.filter((alert) =>
        alert.source_city.toLowerCase().includes(filters.busType?.toLowerCase() || '')
      );
    }

    setFilteredAlerts(filtered);
  };

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      dispatch(setAlerts(data));
      setFilteredAlerts(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.deleteAlert(id);
              loadAlerts();
              Alert.alert('Success', 'Alert deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete alert');
            }
          },
        },
      ]
    );
  };

  const renderAlertItem = ({ item }: { item: AlertItem }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertContent}>
        <Text style={styles.route}>
          {item.source_city} → {item.destination_city}
        </Text>
        <Text style={styles.price}>Target Price: ₹{item.target_price}</Text>
        <Text style={[styles.status, item.is_active && styles.active]}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAlert(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Price Alerts</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('Filter')}
        >
          <Text style={styles.filterButtonText}>⚙ Filters</Text>
        </TouchableOpacity>
      </View>

      {appliedFilters && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            Filters Applied: {appliedFilters.busType ? `Bus Type: ${appliedFilters.busType}` : ''}
          </Text>
          <TouchableOpacity onPress={() => {
            setAppliedFilters(null);
            setFilteredAlerts(alerts);
          }}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredAlerts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {alerts.length === 0 ? 'No price alerts yet' : 'No alerts match your filters'}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateAlert')}
          >
            <Text style={styles.createButtonText}>
              {alerts.length === 0 ? 'Create First Alert' : 'Create Alert'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredAlerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateAlert')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8F4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#B3D9FF',
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  alertContent: {
    flex: 1,
  },
  route: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: '#999',
  },
  active: {
    color: '#34C759',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AlertsListScreen;
