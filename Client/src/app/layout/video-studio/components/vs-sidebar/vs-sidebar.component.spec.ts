import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsSidebarComponent } from './vs-sidebar.component';

describe('VsSidebarComponent', () => {
  let component: VsSidebarComponent;
  let fixture: ComponentFixture<VsSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
