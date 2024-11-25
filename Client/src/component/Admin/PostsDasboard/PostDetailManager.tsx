import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePostsContext } from '../../../Context/PostContext';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './PostDashboard.css';

const PostDetailManager: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // Lấy ID từ URL
  const { state } = usePostsContext();
  const { posts } = state;

  // Tìm bài viết dựa trên ID
  const post = posts.find((p) => p.id === Number(postId));

  if (!post) {
    return <div className="text-center">Không tìm thấy bài viết.</div>;
  }

  return (
    <div className="container post-detail mt-5">
      <h1 className="display-4 mb-4 text-primary font-weight-bold">{post.title}</h1>
      <p className="text-muted mb-2">Ngày xuất bản: {new Date(post.created_at).toLocaleDateString()}</p>
      <p className="text-muted mb-4">Thể loại: {post.news_category.news_category_name}</p>
      <img src={post.thumnail} alt={post.title} className="img-fluid rounded mb-4" />

      {/* Inline CSS styles inside the <style> tag */}
      <style>
        {`
          .content {
            font-size: 1.125rem;
            line-height: 1.75;
            color: #333;
            margin-top: 20px;
            padding-left: 15px;
            padding-right: 15px;
            overflow-wrap: break-word; /* Correct property */
            background-color: #f8f9fa;
            border-radius: 5px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      <div className="content">
        <CKEditor
          editor={ClassicEditor}
          data={post.content}
          config={{
            toolbar: []
          }}
          disabled={true}
        />
      </div>

      <div className="text-center mt-5">
        <Link to="/admin/posts" className="btn btn-secondary btn-lg">Quay lại danh sách bài viết</Link>
      </div>
    </div>
  );
};

export default PostDetailManager;
