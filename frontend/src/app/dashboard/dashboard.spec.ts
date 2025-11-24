import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to products', () => {
    spyOn(router, 'navigate');
    component.goToProducts();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should check screen size', () => {
    component.checkScreenSize();
    expect(typeof component.isScreenSmall).toBe('boolean');
  });
});
