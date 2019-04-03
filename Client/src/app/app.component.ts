import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private router: Router) {
        const loadingIndicatorEl: any = document.getElementsByClassName('loading-indicator')[0];
        const urlPath = window.location.pathname.substring(1).split('/');

        if (urlPath.includes('caption-studio') || urlPath.includes('video-studio') || urlPath.includes('project')) {
            loadingIndicatorEl.style.display = 'block';
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingIndicatorEl.style.display = 'none';
            }, 100);
        });
    }
}
