import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    
    const iteEmail = /^[a-zA-Z]{2,}[a-zA-Z0-9._%+-]*@ite\.edu\.mx$/;
    const ensenadaEmail = /^[a-zA-Z]{2,}[a-zA-Z0-9._%+-]*@ensenada\.edu\.mx$/;

    if(!iteEmail.test(email) && !ensenadaEmail.test(email)){
      Alert.alert('correo invalido', 'solo se aceptan correos con el dominio @ite.edu.mx o @ensenada.edu.mx');
      return;
    }
    try{
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://reset-password-uconnect.vercel.app/'
      })

      if (error) {
        Alert.alert('Error', error.message)
        return
      }

      Alert.alert('exito', 'se envio un enlace de restablecimiento de constraseña a tu correo')
      router.replace('/')
    }catch(error){
       const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
            Alert.alert('Error', errorMessage);
    }
}

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu correo electrónico</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />

        <View style={styles.buttonContainer}>
          <Button 
            title="Enviar correo de recuperación" 
            onPress={handleResetPassword}
            color="#8C092C"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#fff"
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: 'Montserrat-Light',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Montserrat-Light',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    color: '#222',
    fontFamily: 'Montserrat-Light',
    fontSize: 16,
    backgroundColor: '#fafafa',
    width: '100%',
  },
  buttonContainer: {
    marginTop: 18,
    width: '100%',
    overflow: 'hidden',
  },
})