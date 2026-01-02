import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import api from '../api';

const CreateAlertScreen = ({ navigation }: any) => {
  const [sourceCity, setSourceCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const validateInputs = (): boolean => {
    if (!sourceCity.trim()) {
      Alert.alert('Error', 'Please enter source city');
      return false;
    }
    if (!destinationCity.trim()) {
      Alert.alert('Error', 'Please enter destination city');
      return false;
    }
    if (!targetPrice.trim() || isNaN(parseFloat(targetPrice))) {
      Alert.alert('Error', 'Please enter a valid target price');
      return false;
    }
    return true;
  };

  const handleCreateAlert = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await api.createAlert(sourceCity, destinationCity, parseFloat(targetPrice));
      Alert.alert('Success', 'Price alert created successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create Price Alert</Text>
        <Text style={styles.subtitle}>Get notified when prices drop</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>From (Source City)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bangalore"
            placeholderTextColor="#999"
            value={sourceCity}
            onChangeText={setSourceCity}
            editable={!loading}
          />

          <Text style={styles.label}>To (Destination City)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Hyderabad"
            placeholderTextColor="#999"
            value={destinationCity}
            onChangeText={setDestinationCity}
            editable={!loading}
          />

          <Text style={styles.label}>Target Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={targetPrice}
            onChangeText={setTargetPrice}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreateAlert}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Alert</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  formContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#999',
    fontSize: 14,
  },
});

export default CreateAlertScreen;
