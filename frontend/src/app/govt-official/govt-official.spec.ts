import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GovtOfficial } from './govt-official';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('GovtOfficial', () => {
  let component: GovtOfficial;
  let fixture: ComponentFixture<GovtOfficial>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovtOfficial, HttpClientTestingModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GovtOfficial);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages', () => {
    component.loadMessages();
    const req = httpMock.expectOne('http://localhost:5000/govt-messages');
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: '1', text: 'Hello', postedBy: { name: 'Govt', role: 'govtOfficial' }, postedDate: new Date() }]);
    expect(component.messages.length).toBe(1);
  });
});
