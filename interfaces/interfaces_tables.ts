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

export { Category, Course, Post };
