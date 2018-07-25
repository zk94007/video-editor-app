import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoStudioComponent } from './video-studio.component';

describe('VideoStudioComponent', () => {
  let component: VideoStudioComponent;
  let fixture: ComponentFixture<VideoStudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoStudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
