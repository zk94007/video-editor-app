import { Component, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';

import { FontPickerService } from '../../../../shared/services/font-picker.service';
import { Font, FontInterface, GoogleFontInterface, GoogleFontsInterface } from '../../../../shared/interfaces/font-picker.interfaces';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';

import '@jaames/iro';
import { MyColorpicker } from './colorpicker';
import * as $ from 'jquery';

@Component({
  selector: 'app-vs-toolbar',
  templateUrl: './vs-toolbar.component.html',
  styleUrls: ['./vs-toolbar.component.scss']
})
export class VsToolbarComponent implements OnInit, OnDestroy {
  @Input() isTextSelected: boolean;

  public scrollbarConfig;

  public onSetFontFamily = new EventEmitter();
  public onSetFontSize = new EventEmitter();
  public onSetTextBold = new EventEmitter();
  public onSetTextItalic = new EventEmitter();
  public onSetTextUnderline = new EventEmitter();
  public onSetTextAlign = new EventEmitter();

  public classTextAlign = {
    '' : '',
    'left' : 'toolbar__activeItem--left',
    'center' : 'toolbar__activeItem--center',
    'right' : 'toolbar__activeItem--right'
  };

  public props: any = {
    fontFamily: '',
    fontSize: null,
    textColor: '',
    textBold: false,
    textItalic: false,
    textUnderline: false,
    textAlign: '',
    textLineHeight: 1,
    textCharSpacing: 0,
    opacity: 100,
    overlay_count: null,
    order: null,
  };

  public fakelineHeight: number;

  public colorPicker: MyColorpicker;
  public colorPickerColor: string;
  public isChangeColorInput: boolean;

  // FontPicker Variables
  public props_fontpicker: any = {
    loading: false,
    fontAmount: 12,
    loadedFonts: 0,
    googleFonts: [],
    currentFonts: []
  };

  public renderMore: Subject<any> = new Subject();
  public $uns: any = [];

  constructor(private service: FontPickerService, private cdRef: ChangeDetectorRef, private vsService: VideoStudioService) {
    // Perfect Scrollbar config
    this.colorPicker = new MyColorpicker();

    this.scrollbarConfig = {
      wheelSpeed: 0.5,
      wheelPropagation: false,
      suppressScrollX: true
    };
  }

  ngOnInit() {

    this.$uns.push(this.vsService.onSelectOverlay.subscribe((selectedObject) => {

      $('.tool-bar').addClass('tool-bar--active');
      this.props.id = selectedObject.id;
      this.props.overlay_count = selectedObject.overlay_count;
      this.props.order = selectedObject.order;
      this.props.opacity = Math.ceil(selectedObject.opacity * 100);

      if (selectedObject.type === 'textbox') {
        this.isTextSelected = true;
        this.isChangeColorInput = false;

        this.props.fontFamily = selectedObject.fontFamily;
        this.props.fontSize = selectedObject.fontSize;

        this.props.textBold = selectedObject.fontWeight === 'bold';
        this.props.textItalic = selectedObject.fontStyle === 'italic';
        this.props.textUnderline = selectedObject.underline;
        this.props.textAlign = selectedObject.textAlign;
        this.props.textCharSpacing = selectedObject.charSpacing;
        this.props.textLineHeight = selectedObject.lineHeight;

        this.props.textColor = selectedObject.fill;
        this.colorPicker.setColor(this.props.textColor);
        this.colorPickerColor = this.props.textColor.substring(1);

        this.fakelineHeight = this.props.textLineHeight * 10;

        this.onSetFontFamily.emit(this.props.fontFamily);
        this.onSetFontSize.emit(this.props.fontSize);
        this.onSetTextBold.emit(this.props.textBold);
        this.onSetTextItalic.emit(this.props.textItalic);
        this.onSetTextUnderline.emit(this.props.textUnderline);
        this.onSetTextAlign.emit(this.props.textAlign);
      } else {
        this.isTextSelected = false;
      }
    }));

    this.$uns.push(this.vsService.onDeselectOverlay.subscribe(() => {
      $('.tool-bar').removeClass('tool-bar--active');
    }));

    this.$uns.push(this.colorPicker.onColorChange.subscribe((color) => {
      this.props.textColor = color;
      if (this.isChangeColorInput === false) {
        this.colorPickerColor = this.props.textColor.substring(1);
      } else {
        this.isChangeColorInput = false;
      }
      this.vsService.changeTextProps(this.props);
    }));
    /*
     * Initial work for TextPicker
    */

    this.$uns.push(this.renderMore.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(() => this.loadMoreFonts()));

    // loading all google fonts
    this.$uns.push(this.service.getAllFonts('popularity').subscribe((fonts: GoogleFontsInterface) => {
      this.props_fontpicker.loading = false;

      if (fonts.items) {
        this.props_fontpicker.googleFonts = fonts.items.map((font: GoogleFontInterface) => {
          return new Font({
            family: font.family,
            styles: font.variants,
            files: font.files,
            style: null,
            size: null
          });
        });
      }
      this.setDisplayedFontSource();
    }));

    this.$uns.push(this.renderMore.pipe(debounceTime(150), distinctUntilChanged()).subscribe(() => this.loadMoreFonts()));
  }

  ngOnDestroy() {
    this.$uns.forEach(element => {
      element.unsubscribe();
    });
  }

  setFontFamily($event) {
    this.props.fontFamily = $($event.target).data('family');
    this.onSetFontFamily.emit(this.props.fontFamily);

    this.vsService.changeTextProps(this.props);
  }

  setFontSize($event) {
    this.props.fontSize = $($event.target).data('size');
    this.onSetFontSize.emit(this.props.fontSize);

    this.vsService.changeTextProps(this.props);
  }

  changeFontSize(size) {
    this.props.fontSize = size;
    this.onSetFontSize.emit(this.props.fontSize);

    this.vsService.changeTextProps(this.props);
  }

  setTextBold() {
    this.props.textBold = !this.props.textBold;
    this.onSetTextBold.emit(this.props.textBold);

    this.vsService.changeTextProps(this.props);
  }

  setTextItalic() {
    this.props.textItalic = !this.props.textItalic;
    this.onSetTextItalic.emit(this.props.textItalic);

    this.vsService.changeTextProps(this.props);
  }

  setTextUnderline() {
    this.props.textUnderline = !this.props.textUnderline;
    this.onSetTextUnderline.emit(this.props.textUnderline);

    this.vsService.changeTextProps(this.props);
  }

  setTextAlign(textAlign) {
    this.props.textAlign = textAlign;
    this.onSetTextAlign.emit(this.props.textAlign);

    this.vsService.changeTextProps(this.props);
  }

  changeTextColor() {
    this.vsService.changeTextProps(this.props);
  }

  changeTransparent() {
    this.vsService.changeTransparent(this.props.opacity);
  }

  changeLineHeight() {
    this.props.textLineHeight = this.fakelineHeight / 10;
    this.vsService.changeTextProps(this.props);
  }
  changeCharSpacing() {
    this.vsService.changeTextProps(this.props);
  }

  changeArrange(arrange) {
    if (arrange === 1 && this.props.order < this.props.overlay_count) {
      this.props.order += 1;
      this.vsService.changeArrangeOverlay(arrange);
    }
    if (arrange === 2 && this.props.order > 1) {
      this.props.order -= 1;
      this.vsService.changeArrangeOverlay(arrange);
    }
  }

  onColorHexChange(color: string) {
    this.props.textColor = '#' + color;
    this.isChangeColorInput = true;
    this.colorPicker.setColor(this.props.textColor);
  }

  copy() {
    this.vsService.copyOverlay();
  }

  delete() {
    this.vsService.deleteOverlay();
  }

  selectFont(font_family, font_size, font_style) {
    const font = new Font();
    font.family = font_family;
    font.size = font_size;
    font.style = font_style;
  }

  setDisplayedFontSource(): void {
    this.setCurrentFonts(this.props_fontpicker.googleFonts);
  }

  setCurrentFonts(target: Font[]): void {
    if (target !== this.props_fontpicker.currentFonts) {
      this.props_fontpicker.currentFonts = target;
      this.props_fontpicker.loadedFonts = this.props_fontpicker.fontAmount;

      const initialFonts = this.props_fontpicker.currentFonts.slice(0, this.props_fontpicker.fontAmount);
      this.loadGoogleFonts(initialFonts);

      this.cdRef.markForCheck();

      setTimeout(() => {
        // this.textPanelScrollbar.directiveRef.scrollToY(0);
      }, 0);
    }
  }

  private loadGoogleFonts(fonts: Font[]): void {
    fonts.slice(0, this.props_fontpicker.fontAmount).forEach((font: any) => {
      if (font && font.files && !this.vsService.loadFontFamily(font.family)) {
        const style = (font.styles.indexOf('regular') > -1) ?
          '' : ':'  + font.styles.find((x: any) => !isNaN(x));

        this.service.loadFont({ family: font.family, style: style, size: font.size });
        this.vsService.isLoadedFontFamily(font.family);
      }
    });
  }

  private loadMoreFonts(): void {
    if (!this.props_fontpicker.loading && this.props_fontpicker.loadedFonts < this.props_fontpicker.currentFonts.length) {
      const moreFonts = this.props_fontpicker.currentFonts.slice(this.props_fontpicker.loadedFonts, this.props_fontpicker.loadedFonts + this.props_fontpicker.fontAmount);

      this.loadGoogleFonts(moreFonts);

      this.props_fontpicker.loadedFonts += moreFonts.length;

      setTimeout(() => {
        // this.textPanelScrollbar.directiveRef.update();
      }, 0);

      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    }
  }
}
