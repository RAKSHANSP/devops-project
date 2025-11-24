import { Signup } from './signup';
import { AuthService } from '../auth';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('Signup Component (White-box)', () => {
  let component: Signup;
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuth = { signup: jasmine.createSpy('signup') };
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    component = new Signup(mockAuth, mockRouter);
  });

  it('should show error for invalid email', () => {
    component.user.email = 'test@invalid';
    component.onSubmit();
    expect(component.message).toContain('Please enter a valid email');
    expect(component.isSuccess).toBeFalse();
  });

  it('should handle successful signup', (done) => {
    component.user.email = 'test@gmail.com';
    mockAuth.signup.and.returnValue(of({}));
    component.onSubmit();

    setTimeout(() => {
      expect(component.isSuccess).toBeTrue();
      expect(component.message).toContain('Signup successful');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      done();
    }, 2100);
  });

  it('should handle signup error', () => {
    component.user.email = 'test@gmail.com';
    mockAuth.signup.and.returnValue(throwError(() => ({ error: { message: 'Signup failed' } })));
    component.onSubmit();
    expect(component.message).toBe('Signup failed');
    expect(component.isSuccess).toBeFalse();
  });

  it('should navigate back to home on goBack()', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
