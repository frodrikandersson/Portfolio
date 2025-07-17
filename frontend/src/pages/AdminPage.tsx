import { useBlog } from '../contexts/BlogContext';
import { useState } from 'react';

export const AdminPage = () => {
    const { blogPosts, addPost, updatePost, deletePost } = useBlog();
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const handleAdd = () => {
    if (!newTitle.trim()) return;

    const newPost = {
        id: crypto.randomUUID(),
        title: newTitle,
        content: newContent,
        slug: newTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
        authorId: 'admin', 
        createdAt: new Date().toISOString(),
    };

    addPost(newPost);
    setNewTitle('');
    setNewContent('');
};

  return (
    <div>
      <h2>Manage Blog Posts</h2>
      <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" />
      <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Content" />
      <button onClick={handleAdd}>Add Blog</button>

      <ul>
        {blogPosts.map(post => (
          <li key={post.id}>
            <strong>{post.title}</strong>
            <button onClick={() => deletePost(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
