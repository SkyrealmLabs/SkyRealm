import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { wp, hp } from '../helpers/common';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import Recaptcha from 'react-native-recaptcha-that-works';
import { constant } from '../constants';
import { Video } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { Gyroscope } from 'expo-sensors';

const RegisterLocation = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [address, setAddress] = useState('');
    const [coordinate, setCoordinate] = useState('');
    const [media, setMedia] = useState(null);
    const [userData, setUserData] = useState(null); // State to store user data
    const [rotationProgress, setRotationProgress] = useState(0); // Track rotation progress
    const [tiltUpComplete, setTiltUpComplete] = useState(false); // Track tilt-up completion
    const recaptchaRef = useRef(null);
    let totalRotation = 0;

    // Fetch user data from AsyncStorage when the screen is mounted
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('user');
                if (userDataString) {
                    const user = JSON.parse(userDataString); // Parse user data
                    setUserData(user); // Set user data state
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (params?.address) {
            setAddress(params.address);
        }
        if (params?.latitude && params?.longitude) {
            setCoordinate(`${params.latitude}, ${params.longitude}`);
        }
    }, [params]);

    // Track rotation using Gyroscope
    useEffect(() => {
        let subscription;
    
        const subscribe = () => {
            subscription = Gyroscope.addListener(({ x, y, z }) => {
                // Calculate total rotation
                totalRotation += Math.abs(x) + Math.abs(y) + Math.abs(z);
                setRotationProgress((totalRotation / 360).toFixed(2));
            });
            Gyroscope.setUpdateInterval(100); // Update every 100ms
        };
    
        subscribe();
    
        return () => {
            subscription && subscription.remove(); // Clean up the subscription
        };
    }, []);

    const uploadVideo = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setMedia(result.assets[0].uri); // Store video URI
        }
    };

    const deleteMedia = () => {
        setMedia(null);
    };

    const handleRecaptchaVerify = (token) => {
        console.log('ReCAPTCHA token:', token);
        submitTokenToBackend(token);
    };

    const submitTokenToBackend = async (token) => {
        try {
            const response = await fetch(constant.apiAddress + '/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();
            if (data.success) {
                // Alert.alert('Success', 'Verification passed');
                handleSubmitLocation(); // Call the submit function if reCAPTCHA passes
            } else {
                Alert.alert('Failed', 'reCAPTCHA verification failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Verification failed');
        }
    };

    const handleRecaptchaError = (error) => {
        if (error && error.message) {
            console.error('reCAPTCHA error message:', error.message);
        } else {
            console.error('reCAPTCHA error:', error);
        }
    };

    const handleSubmit = () => {
        recaptchaRef.current?.open(); // Trigger reCAPTCHA
    };

    const handleSubmitLocation = async () => {
        if (!address || !coordinate || !media) {
            Alert.alert("Error", "All fields are required.");
            return;
        }
    
        // Split the coordinate into latitude and longitude
        const [latitude, longitude] = coordinate.split(',').map(coord => parseFloat(coord.trim()));
    
        // Round latitude and longitude to 6 decimal places
        const roundedLatitude = latitude.toFixed(6);
        const roundedLongitude = longitude.toFixed(6);
    
        const formData = new FormData();
        formData.append('userID', userData.id); // Assuming userData contains user ID
        formData.append('address', address);
        formData.append('coordinate', JSON.stringify({
            latitude: roundedLatitude,
            longitude: roundedLongitude
        }));
        formData.append('media', {
            uri: media,
            type: 'video/mp4',
            name: 'location-video.mp4'
        });
    
        try {
            const response = await fetch(constant.apiAddress + '/api/location/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
    
            const result = await response.json();
            if (response.status === 201) {
                Alert.alert('Success', result.message);
                router.push('/add_location'); // Navigate to home or another screen after successful submission
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error('Error submitting location:', error);
            Alert.alert('Error', 'Failed to submit location');
        }
    };

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style="white" />
            <View style={styles.header}>
                <BackButton router={router} />
                <Text style={styles.headerTitle}>Add New Location</Text>
            </View>
            <View style={styles.form}>
                <TouchableOpacity style={styles.formRow} onPress={() => router.push('add_coordinate')}>
                    <Text style={styles.label}>Address</Text>
                    <Text style={styles.value}>{address ? address : 'Set Current Location'}</Text>
                </TouchableOpacity>
                <View style={styles.formRow}>
                    <Text style={styles.label}>Coordinate</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g. 2.981566, 101.667885"
                        value={coordinate}
                        onChangeText={setCoordinate}
                        keyboardType="numeric"
                    />
                </View>
                <TouchableOpacity style={styles.formRow} onPress={uploadVideo}>
                    <Text style={styles.label}>Take Video</Text>
                    <Icon name="videocam-outline" size={24} />
                </TouchableOpacity>
            </View>
            {media && (
                <View style={styles.uploadedMediaContainer}>
                    <View style={styles.uploadedMedia}>
                        <Video source={{ uri: media }} style={styles.uploadedVideo} resizeMode="contain" />
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={deleteMedia}>
                        <Icon name="trash-outline" size={24} color="#fff" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>

            {/* Add reCAPTCHA Component */}
            <Recaptcha
                ref={recaptchaRef}
                siteKey={constant.recaptcha.sitekey}
                baseUrl="http://localhost:9054"
                onVerify={handleRecaptchaVerify}
                onExpire={() => console.log('reCAPTCHA expired')}
                onError={handleRecaptchaError}
            />
        </ScreenWrapper>
    );
};

export default RegisterLocation;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 18,
        marginLeft: -20
    },
    form: {
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: {
        fontSize: 16,
        color: '#333',
        // marginRight: 30
    },
    value: {
        fontSize: 16,
        color: '#666',
    },
    textInput: {
        flex: 1,
        padding: 0,
        margin: 0,
        fontSize: 16,
        textAlign: 'right',
    },
    uploadedMediaContainer: {
        marginVertical: hp(2),
        alignItems: 'center',
    },
    uploadedMedia: {
        width: '100%',
        height: hp(20),
        borderRadius: 8,
    },
    uploadedVideo: {
        height: hp(20),
        borderRadius: 8,
        marginHorizontal: wp(5),
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(1),
        backgroundColor: '#ff4d4f',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1),
        borderRadius: 8,
    },
    deleteButtonText: {
        marginLeft: wp(2),
        color: '#fff',
    },
    submitButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
    rotationProgressContainer: {
        padding: 20,
        alignItems: 'center',
    },
    rotationProgressText: {
        fontSize: 16,
        color: '#333',
    },
});
