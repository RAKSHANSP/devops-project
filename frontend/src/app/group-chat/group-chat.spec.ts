import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GroupChat } from './group-chat';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('GroupChat', () => {
  let component: GroupChat;
  let fixture: ComponentFixture<GroupChat>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupChat, HttpClientTestingModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupChat);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'fake-jwt-token');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages', fakeAsync(() => {
    component.loadMessages();
    const req = httpMock.expectOne('http://localhost:5000/group-messages/global');
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: '1', groupId: 'global', sender: { _id: 'u1', role: 'user' }, text: 'Hello', sentDate: new Date() }]);
    tick();
    expect(component.messages.length).toBe(1);
  }));

  it('should set errorMessage if sendMessage with empty message', () => {
    component.newMessage = '';
    component.selectedFile = null;
    component.sendMessage();
    expect(component.errorMessage).toBe('Message or file is required.');
  });

  it('should handle file selection', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as any;
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
  });
});
