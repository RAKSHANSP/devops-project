import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DealerMarket } from './dealer-market';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('DealerMarket', () => {
  let component: DealerMarket;
  let fixture: ComponentFixture<DealerMarket>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerMarket, HttpClientTestingModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DealerMarket);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch dealers and markets on performSearch', fakeAsync(() => {
    component.location = 'Delhi';
    component['performSearch']();
    const dealerReq = httpMock.expectOne(`http://localhost:5000/dealers?location=Delhi`);
    expect(dealerReq.request.method).toBe('GET');
    dealerReq.flush([{ _id: 'd1', name: 'Dealer 1', mobile: '1234567890', location: 'Delhi', address: '', productsOffered: [], rating: 5, postedBy: { name: 'Admin' }, postedDate: new Date() }]);

    const marketReq = httpMock.expectOne(`http://localhost:5000/markets?location=Delhi`);
    expect(marketReq.request.method).toBe('GET');
    marketReq.flush([{ _id: 'm1', name: 'Market 1', location: 'Delhi', type: 'Wholesale', timings: '', contact: '', commodities: [], rating: 4, postedDate: new Date() }]);
    tick();
    expect(component.dealers.length).toBe(1);
    expect(component.markets.length).toBe(1);
  }));
});
