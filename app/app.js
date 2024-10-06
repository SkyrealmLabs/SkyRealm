import { AuthProvider, AuthContext } from './AuthContext'; // Import AuthContext
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { Slot } from 'expo-router'; 
import React, { useContext, useEffect, useState } from 'react';

export default function App() {
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading state (you could check token here)
        setLoading(false);
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <AuthProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar style="auto" />
                <Slot />
            </SafeAreaView>
        </AuthProvider>
    );
}
