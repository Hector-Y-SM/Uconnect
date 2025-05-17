import React, { useState, useEffect } from "react";
import { Alert, Button, TextInput, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Picker } from "@react-native-picker/picker";
import { Course } from "@/interfaces/interfaces_tables";

export default function CompleteProfile() {
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) {
        Alert.alert("Error al obtener cursos", error.message);
      } else {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  const handleSaveProfile = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      Alert.alert("Error al obtener la sesión");
      return;
    }

    const userId = session.user.id;

    const { error: infoError } = await supabase.from("info_user").upsert({
      user_uuid: userId,
      username,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      bio,
      is_first_time: false,
      created_at: new Date(),
    });

    if (infoError) {
      Alert.alert("Error al guardar perfil", infoError.message);
      return;
    }

    if (!selectedCourse) {
      Alert.alert("Por favor selecciona un curso");
      return;
    }

    const { error: courseError } = await supabase.from("user_courses").insert({
      user_uuid: userId,
      course_uuid: selectedCourse,
    });

    if (courseError) {
      Alert.alert("Error al asignar curso", courseError.message);
      return;
    }

    Alert.alert(`¡Bienvenido, ${username}!`);
    router.replace("/(tabs)");
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

            <Text style={{ marginTop: 16 }}>Selecciona un curso</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCourse}
                onValueChange={(itemValue) => setSelectedCourse(itemValue)}
              >
                <Picker.Item label="Selecciona un curso..." value={null} />
                {courses.map((course) => (
                  <Picker.Item
                    key={course.course_uuid}
                    label={course.name_course}
                    value={course.course_uuid}
                  />
                ))}
              </Picker>
            </View>

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
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginVertical: 12,
    overflow: "hidden",
  },
});
