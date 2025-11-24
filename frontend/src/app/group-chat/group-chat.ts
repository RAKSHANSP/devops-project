import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode'; // For token decoding

interface GroupMessage {
  _id: string;
  groupId: string;
  sender: { _id: string; role: string; name?: string };
  text: string;
  sentDate: Date;
  fileUrl?: string; // Optional field for file attachments
}

interface DecodedToken {
  id: string; // Adjust based on your JWT payload (e.g., 'userId', 'sub')
}

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-chat.html',
  styleUrls: ['./group-chat.css']
})
export class GroupChat implements OnInit {
  messages: GroupMessage[] = [];
  newMessage: string = '';
  selectedFile: File | null = null; // For file attachment
  loading = false;
  errorMessage: string = '';
  token = localStorage.getItem('token') || '';
  currentUserId: string | null = null; // Ensure this is initialized

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUserIdFromToken();
    if (this.token) {
      this.loadMessages();
    } else {
      this.errorMessage = 'Please log in to view group chat.';
    }
  }

  // Decode token to get current user ID
  loadUserIdFromToken() {
    if (this.token) {
      try {
        const decoded: DecodedToken = jwtDecode(this.token);
        this.currentUserId = decoded.id; // Adjust 'id' to match your token's field
        console.log('Decoded user ID:', this.currentUserId); // Debug log
      } catch (error) {
        console.error('Error decoding token:', error);
        this.currentUserId = null;
      }
    }
  }

  loadMessages() {
    if (!this.token) {
      this.errorMessage = 'Please log in to view messages.';
      return;
    }

    this.loading = true;
    const url = 'http://localhost:5000/group-messages/global'; // Adjust if using a different groupId

    this.http.get<GroupMessage[]>(url, { 
      headers: { Authorization: `Bearer ${this.token}` } 
    })
      .subscribe({
        next: (data) => {
          console.log('Loaded messages with fileUrls:', data.map(m => ({ _id: m._id, text: m.text, fileUrl: m.fileUrl }))); // Log each message's fileUrl
          this.messages = data.map(msg => ({
            ...msg,
            fileUrl: msg.fileUrl || undefined // Ensure fileUrl is optional
          }));
          this.errorMessage = '';
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading messages:', err);
          this.errorMessage = `Error loading messages: ${err.statusText} (${err.status}) - ${err.error?.message || 'Unknown error'}`;
          if (err.status === 401) {
            this.errorMessage = 'Access denied. Please log in again.';
          }
          this.loading = false;
        }
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() && !this.selectedFile) {
      this.errorMessage = 'Message or file is required.';
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Please log in to send messages.';
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('text', this.newMessage.trim() || '');
    formData.append('groupId', 'global'); // Adjust groupId if needed
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
      console.log('Uploading file details:', {
        name: this.selectedFile.name,
        size: this.selectedFile.size,
        type: this.selectedFile.type,
        lastModified: this.selectedFile.lastModified
      }); // More detailed debug log
    } else {
      console.log('No file attached, sending text only:', this.newMessage.trim());
    }

    console.log('Sending request with token snippet:', this.token.substring(0, 10) + '...');
    console.log('FormData entries:', Array.from(formData.entries())); // Log FormData contents
    this.http.post('http://localhost:5000/group-messages', formData, { 
      headers: { 
        Authorization: `Bearer ${this.token}` 
      } 
    })
      .subscribe({
        next: (res: any) => {
          console.log('Server response:', res); // Log full response
          this.newMessage = ''; // Clear input
          this.selectedFile = null; // Clear file
          this.loadMessages(); // Reload messages
          this.errorMessage = 'Message sent successfully!';
          setTimeout(() => this.errorMessage = '', 3000);
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error sending message:', err);
          this.errorMessage = `Error sending message: ${err.statusText} (${err.status}) - ${err.error?.message || 'Unknown error'}`;
          if (err.status === 401) {
            this.errorMessage = 'Access denied. Please log in again.';
          } else if (err.status === 400) {
            this.errorMessage = 'Bad request. Check file type or message content.';
          } else if (err.status === 413) {
            this.errorMessage = 'File too large. Maximum size exceeded.';
          } else if (err.status === 415) {
            this.errorMessage = 'Unsupported file type.';
          } else if (err.status === 500) {
            this.errorMessage = `Internal server error (500). Check server logs for details: ${err.error?.message || 'No additional info'}`;
          }
          this.loading = false;
        }
      });
  }

  onFileSelected(event: any) {
    const fileInput = event.target as HTMLInputElement;
    this.selectedFile = fileInput.files?.[0] || null;
    console.log('Selected file in onFileSelected:', {
      name: this.selectedFile?.name,
      size: this.selectedFile?.size,
      type: this.selectedFile?.type
    }); // Detailed debug log
    if (this.selectedFile) {
      this.errorMessage = ''; // Clear error if file is selected
    } else {
      this.errorMessage = 'No file selected or selection cancelled.';
    }
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}