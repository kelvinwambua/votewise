import { GoogleIcon } from '@/components/icons/google-icon';
import { authClient } from '@/lib/auth-client';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL:"/(tabs)"
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL:"/(tabs)"
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Google Sign In Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
              <Text style={styles.icon}>🗳️</Text>
            </View>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Sign in to continue your civic journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#E2E8F0' : '#334155' }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#1E293B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  }
                ]}
                placeholder="you@example.com"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: isDark ? '#E2E8F0' : '#334155' }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#1E293B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  }
                ]}
                placeholder="••••••••"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
              <Text style={[styles.dividerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
                loading && styles.buttonDisabled
              ]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <View style={styles.googleContent}>
                <GoogleIcon width={20} height={20} />
                <Text style={[styles.googleButtonText, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Don&apos;t have an account?{' '}
              </Text>
              <Link href="/public" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Manrope_800ExtraBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
  },
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  link: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
});