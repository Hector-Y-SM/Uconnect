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
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text>Ingresa tu correo electrónico</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button 
        title="Enviar correo de recuperación" 
        onPress={handleResetPassword}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6
  }
})