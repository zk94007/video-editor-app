import { TestBed, inject } from '@angular/core/testing';

import { VideoStudioService } from './video-studio.service';

describe('VideoStudioService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VideoStudioService]
    });
  });

  it('should be created', inject([VideoStudioService], (service: VideoStudioService) => {
    expect(service).toBeTruthy();
  }));
});
