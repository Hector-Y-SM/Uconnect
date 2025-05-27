import React, { useEffect, useState } from "react";
import {
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import HeaderWithSearch from "../components/HeaderWithSearch";
import { SafeAreaView } from "react-native-safe-area-context";
import { Post } from "@/interfaces/interfaces_tables";
import PostCard from "../components/PostCard";
import PostFilter from "../components/PostFilter";

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Para filtros
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [orderBy, setOrderBy] = React.useState<"recent" | "oldest">("recent");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const fetchPosts = async () => {
    try {
      setRefreshing(true);

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          post_uuid,
          description,
          image_url,
          created_at,
          user_uuid,
          info_user:info_user ( username ),
          category:category_post ( category_name ),
          post_courses ( courses ( name_course ) )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedPosts: Post[] = data.map((post) => ({
        post_uuid: post.post_uuid,
        description: post.description,
        image_url: post.image_url,
        created_at: post.created_at,
        user_uuid: post.user_uuid,
        info_user: Array.isArray(post.info_user)
          ? post.info_user[0]
          : post.info_user,
        category: Array.isArray(post.category)
          ? post.category[0]
          : post.category,
        courses: post.post_courses?.flatMap((pc) => pc.courses) || [],
      }));

      setPosts(formattedPosts);

      const categoryNames = [
        ...new Set(
          formattedPosts
            .map((post) => post.category?.category_name)
            .filter((name): name is string => typeof name === "string")
        ),
      ];
      setAllCategories(categoryNames);

      const courseNames = [
        ...new Set(
          formattedPosts.flatMap(
            (post) => post.courses?.map((c) => c.name_course) ?? []
          )
        ),
      ];
      setAllCourses(courseNames);
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPosts = React.useMemo(() => {
    let filtered = posts;

    if (selectedCourses.length > 0) {
      filtered = filtered.filter((post) =>
        post.courses?.some((c) => selectedCourses.includes(c.name_course))
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post) =>
        selectedCategories.includes(post.category?.category_name ?? "")
      );
    }

    filtered = filtered.slice();
    filtered.sort((a, b) => {
      if (orderBy === "recent") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });

    return filtered;
  }, [posts, selectedCourses, selectedCategories, orderBy]);

  const handleToggleCourse = (course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearCategories = () => setSelectedCategories([]);

  const handleClearCourses = () => setSelectedCourses([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log("HomeScreen recibió foco - refrescando datos");
      fetchPosts();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const channel = supabase
      .channel("posts-changes-home")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Cambio detectado en posts:", payload.eventType, payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    fetchPosts();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      item={item}
      setSelectedImage={setSelectedImage}
      setModalVisible={setModalVisible}
      onPostUpdated={fetchPosts}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithSearch onPressFilter={() => setFilterVisible(true)} />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.post_uuid}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">
            No hay publicaciones aún.
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
          />
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }}
          onPress={() => setModalVisible(false)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ flex: 1, resizeMode: "contain" }}
            />
          )}
        </TouchableOpacity>
      </Modal>

      <PostFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onToggleCourse={handleToggleCourse}
        onClearCourses={handleClearCourses}
        availableCourses={allCourses}
        selectedCourses={selectedCourses}
        orderBy={orderBy}
        onChangeOrder={setOrderBy}
        // NUEVAS props para categorías
        availableCategories={allCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onClearCategories={handleClearCategories}
      />
    </SafeAreaView>
  );
}
