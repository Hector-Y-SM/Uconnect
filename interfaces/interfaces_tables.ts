  interface Category {
    uuid_category_pk: string;
    category_name: string;
  };

  interface Course {
    course_uuid: string;
    name_course: string;
  };

  interface Post {
  post_uuid: string;
  description: string;
  image_url: string | null;
  created_at: string;
  info_user: { username: string } | null;
  category: { category_name: string } | null;
  course: { name_course: string } | null;
};

  export {
    Category,
    Course,
    Post
  }