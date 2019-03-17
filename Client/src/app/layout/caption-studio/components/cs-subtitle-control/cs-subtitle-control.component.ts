import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-cs-subtitle-control',
  templateUrl: './cs-subtitle-control.component.html',
  styleUrls: ['./cs-subtitle-control.component.scss']
})
export class CsSubtitleControlComponent implements OnInit {

  @Input() public group: FormGroup;

  constructor() {
  }

  ngOnInit() {
  }

  public remove(i: number) {
    const parent = this.group.parent as FormArray;
    const index = parent.value.indexOf(this.group.value);

    if (parent.length > 1) {
      parent.removeAt(index);
    }
  }

  public updateTime(time) {
    this.group.patchValue({
      startTime: null,
      endTime: null
    });
  }

}
