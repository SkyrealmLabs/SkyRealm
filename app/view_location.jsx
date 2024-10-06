import { StyleSheet, View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { wp, hp } from '../helpers/common';
import SearchInput from '../components/SearchInput';
import { constant } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to import AsyncStorage

const view_location = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [userData, setUserData] = useState(null); // State to hold user data

    // Function to fetch locations from API
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
            const data = await response.json();

            if (response.ok) {
                setLocations(data.data); // Set the fetched locations
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch locations');
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

    const handleClear = () => {
        setSearchQuery('');
    };

    const filteredLocations = locations.filter((location) => 
        location.locationAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={styles.locationItem}>
            <View style={styles.locationDetails}>
                <Text style={styles.locationName}>{item.locationAddress}</Text>
                <Text style={styles.locationCoordinates}>
                    {item.latitude}, {item.longitude}
                </Text>
            </View>
            <Text style={[styles.locationStatus, getStatusStyle(item.status)]}>
                {item.status}
            </Text>
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
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search registered location"
                    onClear={handleClear}
                    containerStyles={styles.searchInput}
                />
            </View>
            {loading ? ( // Show loading indicator while fetching data
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={filteredLocations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()} // Use id for key extraction
                    contentContainerStyle={styles.listContent}
                />
            )}
        </ScreenWrapper>
    );
};

export default view_location;

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
    listContent: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(2),
        paddingHorizontal: wp(4),
        marginBottom: hp(1),
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    locationDetails: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    locationCoordinates: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    locationStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },
});
