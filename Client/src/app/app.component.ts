import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor() {
        const bodyEl: HTMLElement = document.getElementsByTagName('body')[0];

        window.addEventListener('load', () => {
            setTimeout(() => {
                bodyEl.classList.add('loaded');
            }, 100);
        });
    }
}
