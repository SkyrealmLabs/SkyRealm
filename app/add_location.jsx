import { StyleSheet, View, TouchableOpacity, Text, FlatList, Modal, TextInput, Button, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { wp, hp } from '../helpers/common';
import SearchInput from '../components/SearchInput';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constant } from '../constants';

const AddLocation = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [photoUri, setPhotoUri] = useState('');
  const [locations, setLocations] = useState([]); // State to store fetched locations
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchLocations = async (userID) => {
    setLoading(true); // Set loading state to true
    try {
        const response = await fetch(constant.apiAddress + '/api/location/getLocationByUserId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID }), // Send userID in the body
        });
        
        // Check if the response is ok
        const data = await response.json();
        
        if (response.ok) {
            if (data.data && data.data.length > 0) {
                setLocations(data.data); // Set the fetched locations
            } else {
                Alert.alert('Info', 'No locations found for this user.');
            } 
        }
    } catch (error) {
        console.error('Error fetching locations:', error);
        Alert.alert('Error', 'An error occurred while fetching locations');
    } finally {
        setLoading(false); // Reset loading state
    }
};


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const user = JSON.parse(userDataString); // Parse user data
          setUserData(user); // Set user data state

          // Fetch locations using the retrieved userID
          if (user.id) {
            fetchLocations(user.id); // Pass userID to fetchLocations
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to run only once when the component mounts

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.uri);
    }
  };

  const renderLocationItem = ({ item }) => (
    <View style={styles.locationItem}>
      <View style={styles.locationInfo}>
        <Icon name="location-outline" size={24} color="#005691" />
        <View style={styles.locationDetails}>
          {/* <Text style={styles.locationTitle}>{item.title}</Text> */}
          <Text style={styles.locationTitle}>{item.locationAddress}</Text>
          <Text style={styles.locationCoordinates}>{item.latitude}, {item.longitude}</Text>
          <Text style={[styles.locationStatus, getStatusStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'green' };
      case 'pending':
        return { color: 'orange' };
      case 'rejected':
        return { color: 'red' };
    }
  };

  return (
    <ScreenWrapper bg='white'>
      <StatusBar style="white" />
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Register New Location</Text>
      </View>
      <MapView style={styles.map}>
        <Marker coordinate={{ latitude: 4.662944, longitude: 101.143673 }} />
      </MapView>
      <TouchableOpacity onPress={() => router.push('register_location')} style={styles.addLocationContainer}>
        <Icon name="add-outline" size={24} color="#005691" />
        <Text style={styles.addLocationText}>Add new location</Text>
      </TouchableOpacity>
      <Text style={styles.sectionHeader}>Registered location</Text>
      <View style={styles.locationListContainer}>
        {loading ? (
          // Replace loading text with ActivityIndicator
          <ActivityIndicator size="large" color="#005691" />
        ) : locations.length > 0 ? (
          <FlatList
            data={locations}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.locationList}
          />
        ) : (
          <Text style={styles.noLocationsText}>No registered locations available.</Text>
        )}
      </View>

      {/* Modal for Current Location */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Coordinate</Text>
              <TextInput
                style={styles.input}
                value={currentLocation ? `${currentLocation.latitude}, ${currentLocation.longitude}` : ''}
                placeholder="e.g. 2.981566, 101.667885"
                editable={false}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Upload Photo/Video</Text>
              <TouchableOpacity onPress={handleImagePick} style={styles.uploadButton}>
                <Icon name="cloud-upload-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    marginTop: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginLeft: -20
  },
  searchInput: {
    flex: 1,
  },
  map: {
    height: hp(20),
    width: '100%',
  },
  currentLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
  },
  currentLocationText: {
    marginLeft: wp(2),
    fontSize: 16,
  },
  locationListContainer: {
    alignItems: 'center', // Center the ActivityIndicator
    justifyContent: 'center', // Center the ActivityIndicator
    flex: 1, // Allow it to take available space
  },
  sectionHeader: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    backgroundColor: '#f5f5f5',
    color: '#8c8c8c',
    fontSize: 14,
  },
  sectionGap: {
    paddingVertical: hp(1),
    backgroundColor: '#f5f5f5',
  },
  locationListContainer: {
    backgroundColor: '#fff'
  },
  locationList: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    width: '100%'
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: hp(2),
    marginHorizontal: wp(2),
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDetails: {
    marginLeft: wp(2),
    marginRight: wp(2),
    width: '85%',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationAddress: {
    color: '#8c8c8c',
    fontSize: 14,
  },
  locationStatus: {
    color: '#8c8c8c',
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: 'bold'
  },
  locationCoordinates: {
    color: '#8c8c8c',
    fontSize: 12,
  },
  addLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
  },
  addLocationText: {
    fontSize: 16,
    marginLeft: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: '#8c8c8c',
  },
  input: {
    width: '60%',
    textAlign: 'right',
    fontSize: 16,
    color: '#000',
  },
  selectLocationButton: {
    backgroundColor: 'transparent',
  },
  selectLocationText: {
    color: '#000',
    fontSize: 16,
  },
  uploadButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    paddingVertical: 10,
    // marginTop: 20,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noLocationsText: {
    fontSize: 16,
    color: '#555', // Change the color to fit your design
    textAlign: 'center',
    marginTop: 20, // Add some space above
  },
});

export default AddLocation;
