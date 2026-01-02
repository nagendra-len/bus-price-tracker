import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api';
import { setAlerts } from '../store';

interface Alert {
  id: number;
  source_city: string;
  destination_city: string;
  target_price: number;
  is_active: boolean;
}

const AlertsListScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const alerts = useSelector((state: any) => state.alerts.items);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      dispatch(setAlerts(data));
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

  const renderAlertItem = ({ item }: { item: Alert }) => (
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
      {alerts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No price alerts yet</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateAlert')}
          >
            <Text style={styles.createButtonText}>Create First Alert</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={alerts}
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
