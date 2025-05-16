import {
  View,
  Text,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Post } from '@/interfaces/interfaces_tables';
import { FontAwesome } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert('Error', 'No session found.');
      return;
    }

    const userId = session.user.id;

    const { data: info, error: infoError } = await supabase
      .from('info_user')
      .select('*')
      .eq('user_uuid', userId)
      .single();

    if (infoError) {
      console.error('Error fetching user info:', infoError.message);
    } else {
      setUserInfo({ ...info, email: session.user.email });
    }

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        post_uuid,
        description,
        image_url,
        created_at,
        user_uuid,
        info_user:info_user (
          username
        ),
        category:category_post (
          category_name
        ),
        post_courses (
          courses (
            name_course
          )
        )
      `)
      .eq('user_uuid', userId)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError.message);
    } else {
      const formattedPosts: Post[] = posts.map((post) => ({
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

      setUserPosts(formattedPosts);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View className="bg-white m-4 p-4 rounded-xl shadow">
      {item.image_url ? (
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(item.image_url);
            setModalVisible(true);
          }}
        >
          <Image
            source={{ uri: item.image_url }}
            className="w-full h-48 rounded-md mb-2"
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      <Text className="font-bold text-lg mb-1">
        @{item.info_user?.username || 'Desconocido'}
      </Text>

      <Text className="text-sm text-gray-500 mb-1">
        Cursos:{' '}
        {item.courses.length > 0
          ? item.courses.map((c) => c.name_course).join(', ')
          : 'No especificado'}
      </Text>

      <Text className="text-sm text-gray-500 mb-2">
        Tipo: {item.category?.category_name || 'No especificado'}
      </Text>

      <Text className="text-gray-700 mb-2">{item.description}</Text>

      <View className="flex-row justify-between mt-2">
        <TouchableOpacity onPress={() => console.log('Comentar', item.post_uuid)}>
          <FontAwesome name="comment-o" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Guardar', item.post_uuid)}>
          <FontAwesome name="bookmark-o" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!userInfo) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      {/* Portada */}
      <View className="h-40 bg-gray-300" />

      {/* Avatar */}
      <View className="items-center -mt-16 px-4">
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          className="w-24 h-24 rounded-full border-4 border-white bg-gray-100"
        />
        <Text className="text-xl font-semibold mt-2">
          {userInfo.first_name} {userInfo.last_name}
        </Text>
        <Text className="text-sm text-gray-500">@{userInfo.username}</Text>
      </View>

      {/* Bio */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-sm text-gray-600">Email: {userInfo.email}</Text>
        <Text className="text-sm text-gray-600">
          Teléfono: {userInfo.phone_number || 'No disponible'}
        </Text>
        <Text className="text-sm text-gray-600">
          Universidad: {userInfo.university || 'No disponible'}
        </Text>
      </View>

      {/* Publicaciones */}
      <View className="flex-1 bg-gray-100">
        <Text className="text-lg font-bold mx-4 mt-4 mb-2">Tus publicaciones</Text>
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.post_uuid}
          renderItem={renderPost}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-6">
              No has creado publicaciones aún.
            </Text>
          }
        />
      </View>

      {/* Modal de imagen */}
      {modalVisible && selectedImage && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-[80%] rounded-md"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSelectedImage(null);
              }}
              className="absolute top-10 right-5 bg-white p-2 rounded-full"
            >
              <FontAwesome name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
