import { trigger, state, style, transition, animate, keyframes, query, stagger} from '@angular/animations';

export let frameAnimation = trigger('frameAnimation', [
    transition ('* => *', [
      query(':enter', style({ opacity: 0 }), {optional: true}),
      query(':enter', stagger('200ms', [
         animate('.8s ease-in', keyframes([
          style({opacity: 0, transform: 'translateX(-50px)', offset: 0, width: 0}),
          style({opacity: 0.7, transform: 'translateX(25px)', offset: .2, width: '*', margin: '0px'}),
          style({opacity: 1, transform: 'translateX(0)', offset: .8, width: '*', margin: '0px'}),
        ]))
      ]), {optional: true}),
      query(':leave', [
        style({ transform: 'scale(1)', opacity: 1, width: '*' }),
        animate('300ms cubic-bezier(.5, -0.6, 1, 0.7)',
         style({
           transform: 'scale(0.5)', opacity: 0,
           width: '0px', margin: '0px'
         }))
      ], {optional: true})
    ])
]);
