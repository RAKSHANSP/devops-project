import { Login } from './login';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Login Component (White-box)', () => {
  let component: Login;
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuth = { login: jasmine.createSpy('login') };
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    component = new Login(mockAuth, mockRouter);
  });

  it('should handle successful login', (done) => {
    const mockResponse = { token: 'abcd1234' };
    mockAuth.login.and.returnValue(of(mockResponse));
    spyOn(localStorage, 'setItem');
    component.onSubmit();

    setTimeout(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abcd1234');
      expect(component.message).toBe('Login Successful');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 1600);
  });

  it('should handle login error', () => {
    mockAuth.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    component.onSubmit();
    expect(component.message).toBe('Invalid credentials');
  });
});
