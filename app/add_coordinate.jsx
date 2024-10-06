import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { wp, hp } from '../helpers/common';
import SearchInput from '../components/SearchInput';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';

const AddCoordinate = () => {
    const router = useRouter();
    const mapRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [coordinate, setCoordinate] = useState({ latitude: 4.662944, longitude: 101.143673 });
    const [currentLocation, setCurrentLocation] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            setCoordinate({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            // Reverse geocode to get nearby places
            let places = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            setNearbyPlaces(places);
        })();
    }, []);

    const geocodeLocationByName = async (locationName) => {
        try {
            let geocodedLocations = await Location.geocodeAsync(locationName);
            if (geocodedLocations.length > 0) {
                return {
                    latitude: geocodedLocations[0].latitude,
                    longitude: geocodedLocations[0].longitude,
                };
            }
            return null;
        } catch (error) {
            console.error("Error in geocoding location", error);
            return null;
        }
    };

    const handleSearchSubmit = async () => {
        if (searchQuery) {
            const newCoordinate = await geocodeLocationByName(searchQuery);
            if (newCoordinate) {
                setCoordinate(newCoordinate);
                setCurrentLocation(newCoordinate);
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        ...newCoordinate,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000); // animate for 1 second
                }

                // Optionally update the nearby places
                let places = await Location.reverseGeocodeAsync(newCoordinate);
                setNearbyPlaces(places);
            } else {
                console.error("Location not found");
            }
        }
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    const handleRegionChangeComplete = async (region) => {
        setCoordinate({
            latitude: region.latitude,
            longitude: region.longitude,
        });

        // Reverse geocode to get updated nearby places
        let places = await Location.reverseGeocodeAsync({
            latitude: region.latitude,
            longitude: region.longitude,
        });
        setNearbyPlaces(places);
    };

    const handleCenterToCurrentLocation = () => {
        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000); // animate for 1 second
        }
    };

    const handleSubmit = () => {
        let selectedAddress = '';
        
        if (selectedPlace) {
            selectedAddress = [
                selectedPlace.name,
                selectedPlace.street,
                selectedPlace.city,
                selectedPlace.region,
                selectedPlace.postalCode
            ].filter(Boolean).join(', ');
        }
    
        router.push({
            pathname: 'register_location',
            params: {
                address: selectedAddress || 'No Address Selected',  // If no address is selected, put a fallback text
                latitude: parseFloat(coordinate.latitude).toFixed(6),
                longitude: parseFloat(coordinate.longitude).toFixed(6),
            },
        });
    };

    const renderPlaceItem = ({ item }) => (
        <TouchableOpacity
            style={styles.placeItem}
            onPress={() => setSelectedPlace(item)}
        >
            <View style={styles.placeTextContainer}>
                <Text style={styles.placeName}>{item.name || `${item.street}, ${item.city}`}</Text>
                <Text style={styles.placeAddress}>{item.street}, {item.city}, {item.region}, {item.postalCode}</Text>
            </View>
            {selectedPlace === item && (
                <Icon name="check-circle" size={24} color="#007bff" style={styles.checkIcon} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style="white" />
            <View style={styles.header}>
                <BackButton router={router} />
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search location"
                    onClear={handleClear}
                    onSubmitEditing={handleSearchSubmit}
                    containerStyles={styles.searchInput}
                />
            </View>
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onRegionChangeComplete={handleRegionChangeComplete}
                >
                    {currentLocation && (
                        <Marker coordinate={currentLocation}>
                            <Icon name="my-location" size={30} color="#007bff" />
                        </Marker>
                    )}
                </MapView>
                {/* Fixed marker at the center */}
                <View style={styles.markerFixed}>
                    <View style={styles.marker}>
                        <Text style={styles.markerTitle}>Set to here</Text>
                        <Text style={styles.markerText}>Confirm your current position</Text>
                    </View>
                    <Icon name="location-pin" size={40} color="#000080" />
                </View>
                {/* Current Location Button */}
                <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={handleCenterToCurrentLocation}
                >
                    <Icon name="my-location" size={20} color="#007bff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={nearbyPlaces}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderPlaceItem}
                style={styles.placeList}
            />

            {/* Prompt the user to select a place */}
            {selectedPlace === null && (
                <Text style={styles.selectPlacePrompt}>Please select a place before confirming.</Text>
            )}

            {/* Confirm Button (disabled if no place is selected) */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    selectedPlace === null ? styles.disabledButton : null
                ]}
                onPress={handleSubmit}
                disabled={selectedPlace === null} // Disable if no place is selected
            >
                <Text style={styles.submitButtonText}>Confirm Location in Map</Text>
            </TouchableOpacity>
        </ScreenWrapper>
    );
};

export default AddCoordinate;

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
    searchInput: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: '100%',
    },
    markerFixed: {
        alignItems: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -100, // half of the icon size to center it
        marginTop: -100, // half of the icon size to center it
    },
    marker: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 128, 0.7)',
        borderRadius: 20,
    },
    markerTitle: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    },
    markerText: {
        color: '#fff',
        textAlign: 'center',
    },
    currentLocationButton: {
        position: 'absolute',
        width: 40,
        height: 40,
        bottom: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 50,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    placeList: {
        backgroundColor: '#fff',
        paddingHorizontal: wp(5),
    },
    placeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(2),
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    placeTextContainer: {
        flex: 1,
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    placeAddress: {
        fontSize: 14,
        color: '#666',
    },
    checkIcon: {
        marginLeft: 10,
    },
    selectPlacePrompt: {
        textAlign: 'center',
        color: 'red',
        marginVertical: hp(2),
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#007bff',
        paddingVertical: hp(2),
        marginHorizontal: wp(5),
        marginBottom: hp(2),
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#aaa',
    },
});
