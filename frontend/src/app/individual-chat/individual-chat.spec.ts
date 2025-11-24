import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IndividualChat } from './individual-chat';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('IndividualChat', () => {
  let component: IndividualChat;
  let fixture: ComponentFixture<IndividualChat>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, CommonModule, IndividualChat]
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualChat);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users successfully', fakeAsync(() => {
    const mockUsers = [{ _id: '1', name: 'User1', email: 'a@a.com', role: 'farmer' }];
    component.token = 'abc';
    component.loadUsers();
    const req = httpMock.expectOne('http://localhost:5000/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
    tick();
    expect(component.users.length).toBe(1);
  }));

  it('should send a message', fakeAsync(() => {
    component.token = 'abc';
    component.selectedUser = { _id: '2', name: 'John', email: 'j@j.com', role: 'dealer' };
    component.newMessageText = 'Hello!';
    component.sendMessage();
    const req = httpMock.expectOne('http://localhost:5000/individual-messages');
    expect(req.request.method).toBe('POST');
    req.flush({});
    tick();
    expect(component.newMessageText).toBe('');
  }));

  it('should filter users correctly', () => {
    component.users = [{ _id: '1', name: 'Alice', email: '', role: '' }, { _id: '2', name: 'Bob', email: '', role: '' }];
    component.searchUserTerm = 'a';
    const result = component.filteredUsers();
    expect(result.length).toBe(1);
  });
});
