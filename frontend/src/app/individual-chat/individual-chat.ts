import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  receiver: { _id: string; name: string };
  text: string;
  sentDate: Date;
}

@Component({
  selector: 'app-individual-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './individual-chat.html',
  styleUrls: ['./individual-chat.css']
})
export class IndividualChat implements OnInit {
  users: User[] = [];
  messages: Message[] = [];
  searchUserTerm: string = '';
  selectedUser: User | null = null;
  newMessageText: string = '';
  token = localStorage.getItem('token') || '';
  userId: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.userId = this.getUserIdFromToken();
    this.loadUsers();
  }

  getUserIdFromToken(): string {
    if (this.token) {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.userId;
    }
    return '';
  }

  loadUsers() {
    this.http.get<User[]>('http://localhost:5000/users', {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (data) => this.users = data,
      error: (err) => alert(err.error.message || 'Error loading users')
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.loadMessages(user._id);
  }

  loadMessages(receiverId: string) {
    this.http.get<Message[]>(`http://localhost:5000/individual-messages/${receiverId}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (data) => this.messages = data,
      error: (err) => alert(err.error.message || 'Error loading messages')
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedUser) return;
    this.http.post('http://localhost:5000/individual-messages', { receiverId: this.selectedUser._id, text: this.newMessageText.trim() }, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: () => {
        this.newMessageText = '';
        this.loadMessages(this.selectedUser!._id);
      },
      error: (err) => alert(err.error.message || 'Error sending message')
    });
  }

  filteredUsers() {
    return this.users.filter(u => u.name.toLowerCase().includes(this.searchUserTerm.toLowerCase()));
  }
}