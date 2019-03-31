import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsAudioPlayerComponent } from './vs-audio-player.component';

describe('VsAudioPlayerComponent', () => {
  let component: VsAudioPlayerComponent;
  let fixture: ComponentFixture<VsAudioPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsAudioPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsAudioPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
