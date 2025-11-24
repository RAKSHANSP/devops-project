import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface GovtMessage {
  _id: string;
  text: string;
  postedBy: { name: string; role: string };
  postedDate: Date;
}

@Component({
  selector: 'app-govt-official',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './govt-official.html',
  styleUrls: ['./govt-official.css']
})
export class GovtOfficial implements OnInit {
  messages: GovtMessage[] = [];
  newMessageText: string = '';
  token = localStorage.getItem('token') || '';
  userRole = localStorage.getItem('userRole') || 'user'; // Fetch from localStorage

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.http.get<GovtMessage[]>('http://localhost:5000/govt-messages')
      .subscribe({
        next: (data) => this.messages = data,
        error: (err) => console.error('Error loading messages:', err)
      });
  }

  postMessage() {
    if (!this.newMessageText.trim()) {
      alert('Message cannot be empty');
      return;
    }
    if (this.userRole !== 'govtOfficial') {
      alert('Only government officials can post announcements');
      return;
    }

    this.http.post('http://localhost:5000/govt-messages', { text: this.newMessageText.trim() }, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).subscribe({
      next: (res: any) => {
        this.newMessageText = '';
        this.loadMessages(); // Refresh the feed
        alert('Announcement posted successfully!');
      },
      error: (err) => alert(err.error.message || 'Error posting announcement')
    });
  }
}