import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Howl } from 'howler';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-vs-audio-player',
    templateUrl: 'vs-audio-player.component.html',
    styleUrls: ['vs-audio-player.component.scss']
})

export class VsAudioPlayerComponent implements OnInit, OnChanges {
    private _audio: Howl;

    public duration$: any = new BehaviorSubject('--:--');

    public isPlay: Boolean = false;

    @Input() file;

    @Input() title;

    @Input() id;

    @Input() inUse: Boolean = false;

    @Input() deleteButton = true;

    @Input() useButton = true;

    @Output() useClick = new EventEmitter(null);

    @Output() deleteClick = new EventEmitter(null);

    constructor() { }

    ngOnChanges(change: SimpleChanges) {
        if (change.file && change.file.currentValue) {
            this.file = change.file.currentValue;
        }

        if (change.title && change.title.currentValue) {
            this.title = change.title.currentValue;
        }
    }

    ngOnInit() {
        this._audio = new Howl({
            src: [this.file]
        });

        this._audio.once('load', () => {
            this.duration$.next(this._fmtMSS(this._audio.duration().toFixed(0)));
        });
    }

    public togglePlay() {
        if (this.isPlay) {
            this._audio.pause();
        } else {
            this._audio.play();

            setInterval(() => {
                this.duration$.next(this._fmtMSS(
                    (<number>this._audio.duration() - <number>this._audio.seek()).toFixed(0)
                ));

                if (this._audio.seek() === 0) {
                    this.isPlay = false;
                }
            }, 1000);
        }

        this.isPlay = !this.isPlay;
    }

    private _fmtMSS(second) {
        return(second - (second %= 60)) / 60 + (9 < second ? ':' : ':0') + second;
    }

    public setUse(mus_id) {
        this.useClick.emit(mus_id);
    }

    public remove(mus_id) {
        this.deleteClick.emit(mus_id);
    }
}
