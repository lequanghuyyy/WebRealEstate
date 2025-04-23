import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Contact {
  id: number;
  name: string;
  avatar: string;
  role?: string;
  online: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class MessagingComponent implements OnInit {
  isLoading = true;
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  selectedContact: Contact | null = null;
  messages: Message[] = [];
  messageForm: FormGroup;
  searchQuery = '';
  currentUserId = 1; // Simulating current user ID

  constructor(private fb: FormBuilder) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Simulate loading data
    setTimeout(() => {
      this.loadContacts();
      this.isLoading = false;
    }, 1000);
  }

  loadContacts(): void {
    // Mock contacts data
    this.contacts = [
      {
        id: 2,
        name: 'John Doe',
        avatar: 'assets/img/avatars/avatar1.jpg',
        role: 'Agent',
        online: true,
        lastMessage: 'Hi, I\'m interested in your property on 123 Main St.',
        lastMessageTime: '10:30 AM',
        unreadCount: 3
      },
      {
        id: 3,
        name: 'Jane Smith',
        avatar: 'assets/img/avatars/avatar2.jpg',
        role: 'Client',
        online: false,
        lastMessage: 'When can we schedule a viewing?',
        lastMessageTime: 'Yesterday',
        unreadCount: 0
      },
      {
        id: 4,
        name: 'Michael Johnson',
        avatar: 'assets/img/avatars/avatar3.jpg',
        online: true,
        lastMessage: 'Thank you for the information.',
        lastMessageTime: '2 days ago',
        unreadCount: 0
      },
      {
        id: 5,
        name: 'Emily Davis',
        avatar: 'assets/img/avatars/avatar4.jpg',
        role: 'Agent',
        online: false,
        lastMessage: 'I\'ll get back to you with more details soon.',
        lastMessageTime: '3 days ago',
        unreadCount: 0
      },
      {
        id: 6,
        name: 'Robert Wilson',
        avatar: 'assets/img/avatars/avatar5.jpg',
        role: 'Client',
        online: true,
        lastMessage: 'Is the property still available?',
        lastMessageTime: '1 week ago',
        unreadCount: 0
      }
    ];
    this.filteredContacts = [...this.contacts];
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.loadMessages(contact.id);
    
    // Mark messages as read when selecting a contact
    if (contact.unreadCount && contact.unreadCount > 0) {
      contact.unreadCount = 0;
    }
  }

  loadMessages(contactId: number): void {
    // Mock messages data
    const mockMessages: Message[] = [
      {
        id: 1,
        senderId: this.currentUserId,
        receiverId: contactId,
        content: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
        read: true
      },
      {
        id: 2,
        senderId: contactId,
        receiverId: this.currentUserId,
        content: 'Hi, I\'m interested in the property you listed on 123 Main Street. Is it still available?',
        timestamp: new Date(Date.now() - 86400000 * 2 + 1800000), // 2 days ago + 30 min
        read: true
      },
      {
        id: 3,
        senderId: this.currentUserId,
        receiverId: contactId,
        content: 'Yes, it\'s still available! Would you like to schedule a viewing?',
        timestamp: new Date(Date.now() - 86400000 * 2 + 3600000), // 2 days ago + 1 hour
        read: true
      },
      {
        id: 4,
        senderId: contactId,
        receiverId: this.currentUserId,
        content: 'That would be great! I\'m available this weekend. Do you have any openings?',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: true
      },
      {
        id: 5,
        senderId: this.currentUserId,
        receiverId: contactId,
        content: 'We have openings on Saturday at 10 AM and 2 PM, and Sunday at 1 PM. Which works best for you?',
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        read: true
      },
      {
        id: 6,
        senderId: contactId,
        receiverId: this.currentUserId,
        content: 'Saturday at 2 PM would be perfect!',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: false
      }
    ];

    // Filter messages for the selected contact
    this.messages = mockMessages.filter(message => 
      (message.senderId === contactId && message.receiverId === this.currentUserId) || 
      (message.senderId === this.currentUserId && message.receiverId === contactId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  sendMessage(): void {
    if (this.messageForm.invalid || !this.selectedContact) {
      return;
    }

    const content = this.messageForm.value.message.trim();
    
    if (content) {
      // Create a new message
      const newMessage: Message = {
        id: this.messages.length + 1,
        senderId: this.currentUserId,
        receiverId: this.selectedContact.id,
        content: content,
        timestamp: new Date(),
        read: false
      };

      // Add message to the list
      this.messages.push(newMessage);

      // Update the contact's last message
      const contactIndex = this.contacts.findIndex(c => c.id === this.selectedContact!.id);
      if (contactIndex !== -1) {
        this.contacts[contactIndex].lastMessage = content;
        this.contacts[contactIndex].lastMessageTime = 'Just now';
        
        // Move this contact to the top of the list
        const contact = this.contacts.splice(contactIndex, 1)[0];
        this.contacts.unshift(contact);
        this.filteredContacts = [...this.contacts];
      }

      // Reset the form
      this.messageForm.reset();
      this.scrollToBottom();
    }
  }

  searchContacts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    this.filteredContacts = this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (contact.lastMessage && contact.lastMessage.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week
      return `${diffDays} days ago`;
    } else {
      // More than a week
      return timestamp.toLocaleDateString();
    }
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getMessageClasses(message: Message): Record<string, boolean> {
    return {
      'my-message': this.isMyMessage(message),
      'other-message': !this.isMyMessage(message)
    };
  }

  // After message is sent, scroll to the bottom of the messages container
  scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 0);
  }
} 