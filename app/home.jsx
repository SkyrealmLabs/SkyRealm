import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import { wp, hp } from '../helpers/common';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const items = [
  {
    id: 1,
    tab: 'Register New Location',
    icon: require('../assets/images/add-location.png'),
    route: 'add_location'
  },
  {
    id: 2,
    tab: 'View Locations Status',
    icon: require('../assets/images/view-location.png'),
    route: 'view_location'
  }
];

const Home = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  const handleProfilePress = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleNavigation = (route) => {
    router.push(route);
    setDropdownVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.clear(); // Clear AsyncStorage on logout
            router.push('login');
          }
        }
      ]
    );
  };

  // Fetch user data from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const user = JSON.parse(userDataString); // Parse JSON string to object
          setUserData(user); // Set user data state
        } else {
          // If no user data found, navigate to login
          router.push('login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Navigate to login in case of error
        router.push('login');
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchUserData();
  }, []);

  // Show loading indicator while checking AsyncStorage
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper bg='white'>
      <StatusBar style='dark' />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>SKYREALM</Text>
          <View>
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              <Image source={require('../assets/images/user-alt.png')} style={styles.profileIcon} />
            </TouchableOpacity>
            {dropdownVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity onPress={() => handleNavigation('profile')} style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>User Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation('notifications')} style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View>
          {/* Optionally display user data */}
          {userData && (
            <Text style={styles.userGreeting}>Welcome, {userData.name}!</Text> // Adjust according to your user data structure
          )}
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={item => item.id.toString()} // Use toString for proper key extraction
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: 'space-between'
            }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity onPress={() => router.push(item.route)} style={styles.item}>
                  <View style={styles.itemContent}>
                    <Image source={item.icon} style={styles.itemIcon} />
                    <Text style={styles.itemText}>{item.tab}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dddddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  profileIcon: {
    width: 30,
    height: 30,
  },
  dropdown: {
    position: 'absolute',
    top: 50, // Adjust this based on your layout
    right: 0,
    width: 150, // Adjust the width of the dropdown
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  userGreeting: {
    fontSize: 18,
    color: theme.colors.text,
    marginVertical: 10,
  },
  item: {
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dddddd'
  },
  itemContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
