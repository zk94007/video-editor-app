import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  public isInVideoStudio: boolean;

  constructor(private _router: Router) {
    this.isInVideoStudio = _router.url.split('/')[1] === 'video-studio' ? true : false;
  }

  ngOnInit() {
  }

}
