import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  postedBy: { _id?: string; name: string; role: string };
  postedDate: Date;
  likes: string[];
  comments: { _id: string; text: string; commentedBy: { name: string }; commentedDate: Date }[];
}

@Component({
  selector: 'app-information-sharing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './information-sharing.html',
  styleUrls: ['./information-sharing.css']
})
export class InformationSharing {
  posts: Post[] = [];
  newPostText: string = '';
  newPostImage: File | null = null;
  previewImage: string | ArrayBuffer | null = null;
  token = localStorage.getItem('token') || '';
  commentText: string = '';
  selectedPostId: string = '';
  backendUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {
    this.loadPosts();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    this.newPostImage = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result;
    reader.readAsDataURL(file);
  }

  loadPosts() {
    this.http.get<Post[]>(`${this.backendUrl}/posts`)
      .subscribe({
        next: (data) => {
          this.posts = data.map(post => ({
            ...post,
            imageUrl: post.imageUrl ? `${this.backendUrl}${post.imageUrl}` : undefined
          }));
        },
        error: (err) => alert('Error loading posts: ' + (err.error?.message || 'Unknown error'))
      });
  }

  createPost() {
    if (!this.newPostText.trim() && !this.newPostImage) {
      return alert('Post must have text or image');
    }

    const formData = new FormData();
    formData.append('text', this.newPostText);
    if (this.newPostImage) formData.append('image', this.newPostImage);

    this.http.post(`${this.backendUrl}/posts`, formData, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        this.newPostText = '';
        this.newPostImage = null;
        this.previewImage = null;
        this.loadPosts();
      },
      error: (err) => alert('Error posting: ' + (err.error?.message || 'Unknown error'))
    });
  }

  addComment(postId: string) {
    if (!this.commentText.trim()) return alert('Comment cannot be empty');
    this.http.post(`${this.backendUrl}/posts/${postId}/comments`, { text: this.commentText.trim() }, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        this.commentText = '';
        this.selectedPostId = '';
        this.loadPosts();
      }
    });
  }

  toggleLike(postId: string) {
    this.http.post(`${this.backendUrl}/posts/${postId}/like`, {}, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe(() => this.loadPosts());
  }

  selectPostForComment(postId: string) {
    this.selectedPostId = postId;
  }

  deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.http.delete(`${this.backendUrl}/posts/${postId}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p._id !== postId);
      },
      error: (err) => alert('Error deleting post: ' + (err.error?.message || 'Unknown error'))
    });
  }

  isOwner(post: Post): boolean {
    if (!this.token) return false;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return post.postedBy && (post.postedBy as any)._id === payload.userId;
    } catch {
      return false;
    }
  }
}
