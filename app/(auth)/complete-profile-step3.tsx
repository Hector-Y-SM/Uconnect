import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Button, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "@/lib/supabase";
import { Course } from "@/interfaces/interfaces_tables";

export default function ProfileStep3() {
  const { username, firstName, lastName, phone } = useLocalSearchParams();
  const [bio, setBio] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error) setCourses(data);
    };
    fetchCourses();
  }, []);

  const handleSubmit = async () => {
    if (!bio || !selectedCourse) {
      Alert.alert('errot',"completa todos los campos para continuar");
      return;
    }


    router.push({
        pathname: "/(auth)/complete-profile-step4",
        params: { username, firstName, lastName, phone, bio, selectedCourse },
    });

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paso 3/4 - cuentanos sobre ti {'@'+username}</Text>

      <Text>Biografía</Text>
      <TextInput
        style={styles.input}
        value={bio}
        onChangeText={setBio}
        multiline
        placeholder={`hola, soy @${username}...`}
      />

      <Text style={{ marginTop: 16 }}>Selecciona un curso</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCourse}
          onValueChange={(value) => setSelectedCourse(value)}
        >
          <Picker.Item label="Selecciona un curso..." value={null} />
          {courses.map((course) => (
            <Picker.Item key={course.course_uuid} label={course.name_course} value={course.course_uuid} />
          ))}
        </Picker>
      </View>

      <Button title="siguiente" onPress={handleSubmit} />
      <Button title="volver" onPress={() => router.back()}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20 },
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
