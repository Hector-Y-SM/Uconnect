import { Smae } from "@/interfaces/smae.supabase";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { supabase } from "@/lib/subapase";

export default function Index() {
  const [alimentos, setAlimentos] = useState<Smae[]>([]);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    loadAlimentos();
  }, []);

  const loadAlimentos = async () => {
    try {
      const { data, error } = await supabase.from("smae").select("*").limit(4);
      if (error) {
        setDataError(error.message);
        console.log("Supabase error:", error.details);
      } else {
        setAlimentos(data ?? []);
      }
    } catch (error) {
      console.log("Network or unexpected error:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {alimentos.length !== 0 ? (
        <FlatList
          ListHeaderComponent={
            <View style={{ marginBottom: 20}}>
              <Text style={{ fontSize: 25, textTransform: "uppercase" }}>
                Lista de alimentos
              </Text>
              <Text>Busqueda Basica</Text>
            </View>
          }
          keyExtractor={(item) => item.id}
          data={alimentos}
          renderItem={(alimento) => (
            <Text style={{ fontSize: 20, fontWeight: "thin" }}>
              {alimento.item.alimento}
            </Text>
          )}
        />
        ) : (
          <>
            <Text>Error</Text>
            <Text>{dataError}</Text>
          </>
        )}
    </View>
  );
}