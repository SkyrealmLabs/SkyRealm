import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { wp, hp } from '../helpers/common';
import Input from '../components/Input';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constant } from '../constants';

const Login = () => {
    const router = useRouter();
    const emailRef = useRef(""); 
    const passwordRef = useRef(""); 
    const [loading, setLoading] = useState(false); 

    const onSubmit = async () => {
        setLoading(true);

        const loginDetails = {
            name: emailRef.current,  
            password: passwordRef.current
        };

        try {
            const response = await fetch(`${constant.apiAddress}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginDetails),
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
            Alert.alert('Error', 'An error occurred while logging in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style='dark' />
            <View style={styles.container}>
                <BackButton router={router} />

                <View>
                    <Text style={styles.welcomeText}>Hey,</Text>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                </View>

                <View style={styles.form}>
                    <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                        Please login to continue
                    </Text>
                    <Input
                        icon={<Icon name='mail' size={26} strokeWidth={1.6} />}
                        placeholder='Enter your email'
                        onChangeText={value => emailRef.current = value}
                    />
                    <Input
                        icon={<Icon name='lock' size={26} strokeWidth={1.6} />}
                        placeholder='Enter your password'
                        secureTextEntry
                        onChangeText={value => passwordRef.current = value}
                    />
                    <Text style={styles.forgotPassword}>
                        Forgot Password?
                    </Text>
                    <Button title={'Login'} loading={loading} onPress={onSubmit} />
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don't have an account?
                        </Text>
                        <Pressable onPress={() => router.push('signup')}>
                            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>Sign up</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default Login;

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
    forgotPassword: {
        textAlign: 'right',
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
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
