import { TestBed } from '@angular/core/testing';

import { ChannelDependenciesService } from './channel-dependencies.service';

describe('ChannelDependenciesService', () => {
  let service: ChannelDependenciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelDependenciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
