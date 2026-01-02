import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { NavigationProps } from '../types';
import api from '../api';

interface BookingData {
  passengerName: string;
  email: string;
  phone: string;
  seats: string;
  travelDate: string;
}

const BookingScreen = ({ navigation, route }: NavigationProps<'CreateAlert'>) => {
  const [bookingData, setBookingData] = useState<BookingData>({
    passengerName: '',
    email: '',
    phone: '',
    seats: '1',
    travelDate: '',
  });
  const [loading, setLoading] = useState(false);
  const alertId = route.params?.alertId || null;

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateTrackerLink = (bookingId: string): string => {
    return `https://bus-price-tracker.app/track/${bookingId}`;
  };

  const sendSMS = async (phoneNumber: string, bookingId: string): Promise<boolean> => {
    try {
      const trackerLink = generateTrackerLink(bookingId);
      const message = `Your bus booking is confirmed! Booking ID: ${bookingId}. Track your journey: ${trackerLink}`;
      
      // Call backend SMS service
      await api.post('/notifications/sms', {
        phone: phoneNumber,
        message: message,
      });
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  };

  const sendEmail = async (email: string, bookingId: string): Promise<boolean> => {
    try {
      const trackerLink = generateTrackerLink(bookingId);
      
      // Call backend Email service
      await api.post('/notifications/email', {
        to: email,
        subject: 'Bus Booking Confirmation',
        template: 'booking_confirmation',
        data: {
          bookingId: bookingId,
          passengerName: bookingData.passengerName,
          travelDate: bookingData.travelDate,
          trackerLink: trackerLink,
        },
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  };

  const shareViaWhatsApp = async (bookingId: string): Promise<void> => {
    try {
      const trackerLink = generateTrackerLink(bookingId);
      const message = encodeURIComponent(
        `🚌 *Bus Booking Confirmed!*\n\n` +
        `📌 Booking ID: ${bookingId}\n` +
        `👤 Passenger: ${bookingData.passengerName}\n` +
        `📅 Travel Date: ${bookingData.travelDate}\n` +
        `🪑 Seats: ${bookingData.seats}\n\n` +
        `📍 *Live Tracker:* ${trackerLink}\n\n` +
        `Click the link above to track your bus in real-time!`
      );

      const whatsappUrl = `whatsapp://send?phone=${bookingData.phone}&text=${message}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      console.error('WhatsApp sharing failed:', error);
      Alert.alert('Error', 'Failed to share via WhatsApp');
    }
  };

  const handleBookNow = async () => {
    // Validation
    if (!bookingData.passengerName.trim()) {
      Alert.alert('Error', 'Please enter passenger name');
      return;
    }
    if (!bookingData.email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return;
    }
    if (!bookingData.phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }
    if (!bookingData.travelDate.trim()) {
      Alert.alert('Error', 'Please select travel date');
      return;
    }

    setLoading(true);
    try {
      // Create booking
      const response = await api.post('/bookings', {
        alertId: alertId,
        passengerName: bookingData.passengerName,
        email: bookingData.email,
        phone: bookingData.phone,
        seats: parseInt(bookingData.seats),
        travelDate: bookingData.travelDate,
      });

      const bookingId = response.data.id || response.data.bookingId;

      // Send SMS notification
      const smsSent = await sendSMS(bookingData.phone, bookingId);
      if (smsSent) {
        Alert.alert('Success', 'SMS confirmation sent!');
      }

      // Send Email notification
      const emailSent = await sendEmail(bookingData.email, bookingId);
      if (emailSent) {
        Alert.alert('Success', 'Email confirmation sent!');
      }

      // Show booking confirmation with options
      Alert.alert(
        'Booking Confirmed!',
        `Your booking ID: ${bookingId}\n\nWould you like to share the live tracker link via WhatsApp?`,
        [
          {
            text: 'Share via WhatsApp',
            onPress: () => shareViaWhatsApp(bookingId),
          },
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to alerts
              navigation.navigate('AlertsList');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Book Your Seats</Text>
        <Text style={styles.subtitle}>Enter your details to complete the booking</Text>

        {/* Passenger Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Passenger Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={bookingData.passengerName}
            onChangeText={(value) => handleInputChange('passengerName', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={bookingData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
        </View>

        {/* Phone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit phone number"
            value={bookingData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#999"
          />
        </View>

        {/* Travel Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Travel Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={bookingData.travelDate}
            onChangeText={(value) => handleInputChange('travelDate', value)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Number of Seats */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Seats *</Text>
          <View style={styles.seatSelector}>
            {['1', '2', '3', '4', '5', '6'].map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.seatButton,
                  bookingData.seats === num && styles.seatButtonActive,
                ]}
                onPress={() => handleInputChange('seats', num)}
              >
                <Text
                  style={[
                    styles.seatButtonText,
                    bookingData.seats === num && styles.seatButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.notesText}>
          📱 We'll send booking confirmation via SMS and Email\n\n
          📍 Live tracker link will be shared for real-time journey tracking
        </Text>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Now</Text>
          )}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
  },
  seatSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  seatButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  seatButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  seatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  seatButtonTextActive: {
    color: '#fff',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  bookButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookingScreen;
