import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InformationSharing } from './information-sharing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('InformationSharing', () => {
  let component: InformationSharing;
  let fixture: ComponentFixture<InformationSharing>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, CommonModule, InformationSharing]
    }).compileComponents();

    fixture = TestBed.createComponent(InformationSharing);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load posts successfully', fakeAsync(() => {
    const mockPosts = [
      { _id: '1', text: 'Hello', postedBy: { name: 'Farmer', role: 'user' }, postedDate: new Date(), likes: [], comments: [] }
    ];
    component.loadPosts();
    const req = httpMock.expectOne('http://localhost:5000/posts');
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
    tick();
    expect(component.posts.length).toBe(1);
  }));

  it('should validate post content before creating', () => {
    component.newPostText = '';
    component.newPostImage = null;
    spyOn(window, 'alert');
    component.createPost();
    expect(window.alert).toHaveBeenCalledWith('Post must have text or image');
  });

  it('should delete a post', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockId = '123';
    component.deletePost(mockId);
    const req = httpMock.expectOne(`http://localhost:5000/posts/${mockId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    tick();
  }));
});
