import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtitleListComponent } from './subtitle-list.component';

describe('SubtitleListComponent', () => {
  let component: SubtitleListComponent;
  let fixture: ComponentFixture<SubtitleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtitleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtitleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
