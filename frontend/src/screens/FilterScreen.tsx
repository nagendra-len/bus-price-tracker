import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { NavigationProps } from '../types';
import { PriceAlert } from '../types';

const FilterScreen = ({ navigation, route }: NavigationProps<'CreateAlert'>) => {
  const [filters, setFilters] = useState<Partial<PriceAlert>>({
    busType: '',
    departureTimeFrom: '',
    departureTimeTo: '',
    arrivalTimeFrom: '',
    arrivalTimeTo: '',
  });

  const handleFilterChange = (key: keyof PriceAlert, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    navigation.navigate('AlertsList', { filters });
  };

  const handleResetFilters = () => {
    setFilters({
      busType: '',
      departureTimeFrom: '',
      departureTimeTo: '',
      arrivalTimeFrom: '',
      arrivalTimeTo: '',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Filter Bus Prices</Text>

        {/* Bus Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>Bus Type</Text>
          <View style={styles.optionsContainer}>
            {['AC', 'Non-AC', 'Sleeper', 'Seater'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  filters.busType === type && styles.optionButtonActive,
                ]}
                onPress={() => handleFilterChange('busType' as keyof PriceAlert, type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    filters.busType === type && styles.optionTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Departure Time Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>Departure Time Range</Text>
          <View style={styles.timeRange}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>From</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={filters.departureTimeFrom || ''}
                onChangeText={(value) =>
                  handleFilterChange('departureTimeFrom' as keyof PriceAlert, value)
                }
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>To</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={filters.departureTimeTo || ''}
                onChangeText={(value) =>
                  handleFilterChange('departureTimeTo' as keyof PriceAlert, value)
                }
              />
            </View>
          </View>
        </View>

        {/* Arrival Time Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.label}>Arrival Time Range</Text>
          <View style={styles.timeRange}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>From</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={filters.arrivalTimeFrom || ''}
                onChangeText={(value) =>
                  handleFilterChange('arrivalTimeFrom' as keyof PriceAlert, value)
                }
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>To</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={filters.arrivalTimeTo || ''}
                onChangeText={(value) =>
                  handleFilterChange('arrivalTimeTo' as keyof PriceAlert, value)
                }
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetFilters}
        >
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.applyButton]}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  filterSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
  },
  timeRange: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  resetButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterScreen;
