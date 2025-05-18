import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  
  const handleLogin = async () => {
    /*const iteEmail = /^[a-zA-Z]{2,}[a-zA-Z0-9._%+-]*@ite\.edu\.mx$/;
    const ensenadaEmail = /^[a-zA-Z]{2,}[a-zA-Z0-9._%+-]*@ensenada\.edu\.mx$/;

    if(!iteEmail.test(email) && !ensenadaEmail.test(email)){
        Alert.alert('correo invalido', 'solo se aceptan correos con el dominio @ite.edu.mx o @ensenada.edu.mx');
        return;
    }*/

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('error de inicio de sesión', error.message);
      return;
    }

    router.replace('./entry-checker');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.icon}>{showPassword ? '🚫' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <Button title="Ingresar" onPress={handleLogin} />

      <TouchableOpacity 
        style={styles.forgotPassword} 
        onPress={() => router.push('/resetPassword')}
      >
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPassword} 
        onPress={() => router.push('/register')}
      >
        <Text style={styles.forgotPasswordText}>¿Aun no tienes una cuenta? registrate aqui</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderColor: '#ccc',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    fontSize: 18,
    marginLeft: 10,
  },
  forgotPassword: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  signupContainer: {
    marginTop: 20,
  },
});
