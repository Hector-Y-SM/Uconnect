import React, { useState } from 'react';
import { Alert, Button, TextInput, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function CompleteProfile() {
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const router = useRouter();

  const handleSaveProfile = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      Alert.alert('Error al obtener la sesión');
      return;
    }

    const userId = session.user.id;

    const { error } = await supabase.from('info_user').upsert({
      user_uuid: userId,
      username,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      bio,
      is_first_time: false,
      created_at: new Date()
    });

    if (error) {
      Alert.alert('Error al guardar perfil', error.message);
      return;
    }

    Alert.alert(`¡Bienvenido, ${username}!`);
    router.replace('/homeScreen');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text>Nombre de usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre de usuario"
              value={username}
              onChangeText={setUsername}
            />

            <Text>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nombre"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text>Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu apellido"
              value={lastName}
              onChangeText={setLastName}
            />
            <Button title="Siguiente" onPress={() => setStep(2)} />
          </>
        );
      case 2:
        return (
          <>
            <Text>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu número de teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Button title="Siguiente" onPress={() => setStep(3)} />
          </>
        );
      case 3:
        return (
          <>
            <Text>Biografía</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe una breve biografía"
              value={bio}
              onChangeText={setBio}
              multiline
            />
            <Button title="Finalizar Registro" onPress={handleSaveProfile} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completa tu perfil ({step}/3)</Text>
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 },
});
