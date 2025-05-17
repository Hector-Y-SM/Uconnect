interface Category {
  uuid_category_pk: string;
  category_name: string;
}

interface Course {
  course_uuid: string;
  name_course: string;
}

interface Post {
  post_uuid: string;
  description: string;
  image_url: string | null;
  created_at: string;
  info_user: { username: string } | null;
  category: { category_name: string } | null;
  courses: { name_course: string }[]; 
}

interface UserInfo {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number?: string;
  university?: string;
  course?: string;
  portada_url?: string;
  icon_url?: string;
}

export { Category, Course, Post, UserInfo };
