import { Alert, Pressable, StyleSheet, Text, View, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Icon from '../assets/icons'
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme'
import { constant } from '../constants'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { wp, hp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const nameRef = useRef("");
    const passwordRef = useRef("");
    const confirmPasswordRef = useRef("");
    const phoneNoRef = useRef(""); // Phone number reference
    const [loading, setLoading] = useState(false);

    const loginUser = async (name, password) => {
        try {
            const response = await fetch(constant.apiAddress + '/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    password,
                }),
            });

            const result = await response.json();

            if (response.status === 200) {
                // Store the token and user data in AsyncStorage
                await AsyncStorage.setItem('token', result.token); // Store token
                await AsyncStorage.setItem('user', JSON.stringify(result.user)); // Store user data

                router.push("home"); 
            } else {
                Alert.alert('Login Failed', result.message || 'Invalid email or password');
            }

        } catch (error) {
            Alert.alert('Error', 'Something went wrong while logging in.');
        }
    };

    const onSubmit = async () => {
        if (!emailRef.current || !nameRef.current || !passwordRef.current || !confirmPasswordRef.current || !phoneNoRef.current) {
            Alert.alert('Signup', "Please fill all the fields!");
            return;
        } 
        
        if (passwordRef.current !== confirmPasswordRef.current) {
            Alert.alert('Signup', "Password and confirm password should be the same!");
            return;
        }

        setLoading(true); // Show loading

        // Send the data to the API
        try {
            const response = await fetch(constant.apiAddress + '/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: nameRef.current,
                    email: emailRef.current,
                    password: passwordRef.current,
                    phoneno: phoneNoRef.current // Include the phone number
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Signup', result.message); // Success message
                // Automatically log the user in after signup
                await loginUser(emailRef.current, passwordRef.current);
            } else {
                Alert.alert('Signup Error', result.message); // Error message
            }

        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false); // Hide loading
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                    <ScreenWrapper bg='white'>
                        <StatusBar style='dark' />
                        <View style={styles.container}>
                            <BackButton router={router} />
                            <View>
                                <Text style={styles.welcomeText}>Let's</Text>
                                <Text style={styles.welcomeText}>Get Started</Text>
                            </View>
                            <View style={styles.form}>
                                <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                                    Please fill in the details to create an account
                                </Text>
                                <Input
                                    icon={<Icon name='user' size={26} strokeWidth={1.6} />}
                                    placeholder='Enter your name'
                                    onChangeText={value => nameRef.current = value}
                                />
                                <Input
                                    icon={<Icon name='mail' size={26} strokeWidth={1.6} />}
                                    placeholder='Enter your email'
                                    onChangeText={value => emailRef.current = value}
                                />
                                <Input
                                    icon={<Icon name='phone' size={26} strokeWidth={1.6} />}
                                    placeholder='Enter your phone number'
                                    keyboardType='phone-pad'
                                    onChangeText={value => phoneNoRef.current = value}
                                />
                                <Input
                                    icon={<Icon name='lock' size={26} strokeWidth={1.6} />}
                                    placeholder='Enter your password'
                                    secureTextEntry
                                    onChangeText={value => passwordRef.current = value}
                                />
                                <Input
                                    icon={<Icon name='lock' size={26} strokeWidth={1.6} />}
                                    placeholder='Confirm your password'
                                    secureTextEntry
                                    onChangeText={value => confirmPasswordRef.current = value}
                                />
                                <Button title={'Signup'} loading={loading} onPress={onSubmit} />
                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Already have an account!</Text>
                                    <Pressable onPress={() => router.push('login')}>
                                        <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>Login</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </ScreenWrapper>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );    
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form: {
        gap: 25,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});