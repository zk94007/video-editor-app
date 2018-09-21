import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAdminComponent } from './confirm-admin.component';

describe('ConfirmAdminComponent', () => {
  let component: ConfirmAdminComponent;
  let fixture: ComponentFixture<ConfirmAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
