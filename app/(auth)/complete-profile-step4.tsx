import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileInfo from "../components/profileInfo";


export default function CompleteProfileStep4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { username, firstName, lastName, phone, bio, selectedCourse } = params;
  
  const [courseInfo, setCourseInfo] = useState("");
  const [userInfo, setUserInfo] = useState({
    first_name: firstName as string,
    last_name: lastName as string,
    username: username as string,
    email: "",
    phone_number: phone as string,
    university: "Instituto Tecnologico de Ensenada", 
    course: "Cargando...",
    portada_url: undefined as string | undefined,
    icon_url: undefined as string | undefined,
    bio: bio as string,
  });
  
  const [loading, setLoading] = useState(false);

  // Obtener el email del usuario actual y su cusro
  useEffect(() => {
    const getSessionInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUserInfo(prevState => ({
          ...prevState,
          email: session.user.email || ""
        }));
      }
    };
    
    getSessionInfo();
  }, []);

 
  useEffect(() => {
    const fetchCourseName = async () => {
      if (selectedCourse) {
        const { data, error } = await supabase
          .from("courses")
          .select("name_course")
          .eq("course_uuid", selectedCourse)
          .single();
          
        if (!error && data) {
          setCourseInfo(data.name_course);
          setUserInfo(prevState => ({
            ...prevState,
            course: data.name_course
          }));
        }
      }
    };
    
    fetchCourseName();
  }, [selectedCourse]);

  const refreshUserInfo = async (newUrl?: string, fieldToUpdate?: "portada_url" | "icon_url") => {
    console.log('en edicion de foto', newUrl, fieldToUpdate);
    

    if (newUrl && fieldToUpdate) {
      setUserInfo(prevState => ({
        ...prevState,
        [fieldToUpdate]: newUrl
      }));
      return;
    }
    

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    console.log('despues de la edicion');

    const { data, error } = await supabase
      .from("info_user")
      .select("portada_url, icon_url")
      .eq("user_uuid", session.user.id)
      .single();
      
    if (!error && data) {
      setUserInfo(prevState => ({
        ...prevState,
        portada_url: data.portada_url,
        icon_url: data.icon_url
      }));
    }
  };

  const handleFinishRegistration = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        Alert.alert('Error de autenticación', "Sesión no válida");
        return;
      }

      const userId = session.user.id;

      
      const { error: profileError } = await supabase.from("info_user").upsert({
        user_uuid: userId,
        username: username as string,
        first_name: firstName as string,
        last_name: lastName as string,
        phone_number: phone as string,
        bio: bio as string,
        is_first_time: false,
        portada_url: userInfo.portada_url,
        icon_url: userInfo.icon_url
      });

      if (profileError) {
        Alert.alert("Error al guardar perfil", profileError.message);
        return;
      }

      const { error: courseError } = await supabase.from("user_courses").insert({
        user_uuid: userId,
        course_uuid: selectedCourse as string,
      });

      if (courseError) {
        Alert.alert("Error al guardar curso", courseError.message);
        return;
      }

      Alert.alert(
        "¡Registro completo!",
        "Tu perfil ha sido creado con éxito.",
        [{ text: "Continuar", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo completar el registro.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Paso 4/4 - ¡Completa tu perfil!</Text>
        <Text style={styles.subtitle}>
          Esta es una vista previa de cómo se verá tu perfil. Puedes añadir una foto de 
          perfil y una imagen de portada antes de finalizar.
        </Text>
        
        {/* ProfileInfo mostrará la información del usuario */}
        <ProfileInfo 
          userInfo={userInfo} 
          refreshUserInfo={refreshUserInfo} 
          isOnboarding={true} 
        />
        
        <View style={styles.bioContainer}>
          <Text style={styles.bioLabel}>Sobre mí:</Text>
          <Text style={styles.bioText}>{bio}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Volver" 
            onPress={() => router.back()} 
          />
          <Button 
            title={loading ? "Finalizando..." : "Completar registro"} 
            onPress={handleFinishRegistration}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  bioContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
});