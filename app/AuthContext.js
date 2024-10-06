import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
            }
        };
        loadToken();
    }, []);

    const logout = async () => {
        setToken(null);
        await AsyncStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
