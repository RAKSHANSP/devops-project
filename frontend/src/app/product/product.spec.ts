import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductComponent } from './product';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, CommonModule, ProductComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load products successfully', fakeAsync(() => {
    const mockProducts = [
      { _id: '1', name: 'Tomato', description: 'Fresh', quantity: 10, price: 50, location: 'Chennai', phone: '9876543210', postedBy: { name: 'Farmer' }, postedDate: new Date() }
    ];
    component.token = 'abc';
    component.loadProducts();
    const req = httpMock.expectOne('http://localhost:5000/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
    tick();
    expect(component.products.length).toBe(1);
  }));

  it('should handle 401 error while loading products', fakeAsync(() => {
    component.token = 'abc';
    component.loadProducts();
    const req = httpMock.expectOne('http://localhost:5000/products');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    tick();
    expect(component.errorMessage).toContain('Please log in');
  }));

  it('should validate required fields before saving', () => {
    component.currentProduct = { name: '', description: '', quantity: 0, price: 0, location: '', phone: '' };
    component.selectedImage = null;
    component.saveProduct();
    expect(component.errorMessage).toBe('Name is required');
  });

  it('should show invalid phone number message', () => {
    component.currentProduct = { name: 'A', description: 'B', quantity: 10, price: 100, location: 'X', phone: '123' };
    component.selectedImage = new File([], 'test.png');
    component.token = 'abc';
    component.saveProduct();
    expect(component.errorMessage).toBe('Phone number must be exactly 10 digits');
  });

  it('should call delete API when deleting product', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.token = 'abc';
    component.deleteProduct('1');
    const req = httpMock.expectOne('http://localhost:5000/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    tick();
    expect(component.errorMessage).toContain('deleted');
  }));
});
