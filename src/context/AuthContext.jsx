import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, extractErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const initAuth = async () => {
        const storedToken = localStorage.getItem('citizen_access_token');
        const storedUser = authApi.getCurrentUser();

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
            // Optionally fetch fresh profile in background
            try {
                const res = await authApi.getMe();
                if (res.data?.data) {
                    setUser(res.data.data);
                    localStorage.setItem('citizen_user', JSON.stringify(res.data.data));
                }
            } catch {
                // If token invalid, storage will be handled by axios interceptor
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        initAuth();

        const handleAuthExpired = () => {
            setToken(null);
            setUser(null);
        };

        const handleAuthChanged = () => {
            const currentToken = localStorage.getItem('citizen_access_token');
            const currentUser = authApi.getCurrentUser();
            setToken(currentToken);
            setUser(currentUser);
        };

        window.addEventListener('citizen_auth_expired', handleAuthExpired);
        window.addEventListener('citizen_auth_changed', handleAuthChanged);

        return () => {
            window.removeEventListener('citizen_auth_expired', handleAuthExpired);
            window.removeEventListener('citizen_auth_changed', handleAuthChanged);
        };
    }, []);

    const login = async (mobile, password) => {
        try {
            const res = await authApi.login({ mobile, password });
            const data = res.data?.data;
            if (data?.access_token) {
                localStorage.setItem('citizen_access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('citizen_refresh_token', data.refresh_token);
                }
                const userData = data.user || { mobile, role: 'citizen', name: 'Citizen' };
                localStorage.setItem('citizen_user', JSON.stringify(userData));
                setToken(data.access_token);
                setUser(userData);
                return { success: true, user: userData };
            }
            throw new Error('No access token returned');
        } catch (err) {
            const message = extractErrorMessage(err);
            return { success: false, error: message };
        }
    };

    const register = async ({ name, mobile, password, village = 'Vemavaram' }) => {
        try {
            const res = await authApi.register({ name, mobile, password, village });
            const data = res.data?.data;
            if (data?.access_token) {
                localStorage.setItem('citizen_access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('citizen_refresh_token', data.refresh_token);
                }
                const userData = data.user || { name, mobile, role: 'citizen', village };
                localStorage.setItem('citizen_user', JSON.stringify(userData));
                setToken(data.access_token);
                setUser(userData);
                return { success: true, user: userData };
            }
            throw new Error('Registration failed to return token');
        } catch (err) {
            const message = extractErrorMessage(err);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        authApi.logout();
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

