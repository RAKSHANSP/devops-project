/***************************************************************************************************
 * Zone.js and TestBed setup for Angular unit tests
 ***************************************************************************************************/
import 'zone.js'; // ✅ Required by Angular
import 'zone.js/testing'; // ✅ Required for fakeAsync and async tests

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
