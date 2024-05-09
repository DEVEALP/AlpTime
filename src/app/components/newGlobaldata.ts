import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export abstract class newGlobalData {

//   public static api: string = "http://10.72.20.120:8431/api/";
  public static api: string = "";
//   public static api: string = "";

  public static version = '2.0.14'

  public static dataUser = { id: 0, id_session: 0, versions: "", new_version: "", nameuser: " ", imageuser: '', rol: 0, genero: '', id_business: 0, name_business: "", image_business: "", color_primary: "", color_secondary: "", color_tertiary: "", accent: "", theme: false }
  public static token = "";
  public static theme = false;
  public static FontSize = 14
  public static apps = []


   static loadTheme() {
      var css = ``
      var style = document.querySelector("#Theme");
      if (this.theme) {
         css = `
                .color { color: white !important; } 
                .color1 { color: rgb(235, 235, 235) !important; } 
                .color2 { color: rgb(210, 210, 210) !important; } 
                .color3 { color: rgb(190, 190, 190) !important; } 
                .color4 { color: rgb(150, 150, 150) !important; } 
                .valid > svg > circle { stroke: rgb(230, 230, 230) !important; } 
                .mat-input-element::placeholder { color: rgba(255, 255, 255, .5) !important; }
                .background  { background: rgb(0, 0, 0) !important; }
                .background1 { background: rgb(25, 25, 25) !important; }
                .background2 { background: rgb(40, 40, 40) !important; }
                .background3 { background: rgb(60, 60, 60) !important; }
                .background4 { background: rgb(110, 110, 110) !important; }
                .background5 { background: rgb(180, 180, 180) !important; }
                .background6 { background: rgb(240, 240, 240) !important; }
                .background3_invert { background: rgb(195, 195, 195) !important; }
                ::-webkit-scrollbar-track { background-color: rgb(40, 40, 40); }
                ::-webkit-scrollbar-thumb { background-color: rgb(0, 0, 0); border-radius: 4px; }
                .mat-ripple-element { background-color: rgba(255, 255, 255, .1) }
                .mat-select-value{ color: rgba(255, 255, 255, 0.85) !important; }
                .mat-datepicker-toggle { color: rgba(255, 255, 255, .5) !important; }
                .mat-checkbox-frame { border-color: rgba(255, 255, 255, 0.54) !important; }
                .mat-form-field-appearance-outline .mat-form-field-outline{ color: rgba(255, 255, 255, 0.2) !important; } 
                .mat-form-field-appearance-legacy .mat-form-field-underline{ border-color: rgba(255, 255, 255, 0.42) !important; }
                .mat-form-field-appearance-legacy .mat-form-field-label{ color: rgba(255, 255, 255, 0.54) !important;}
                .alert-container > .mat-dialog-container .dialog__surface{ border-radius: 18px !important; background: rgb(30, 30, 30); padding: 0px; }
                .settings-container > .mat-dialog-container .dialog__surface{ border-radius: 18px !important; background: rgb(30, 30, 30); padding: 15px 20px; }  
                .mat-slide-toggle-bar{ background-color: rgb(255 255 255 / 38%) }
                .asignUser > .mat-dialog-container{ border-radius: 16px; padding: 15px; background: rgba(25, 25, 25, 1); }
                .viewUser > .mat-dialog-container{ border-radius: 16px; padding: 5px; background: rgba(25, 25, 25, 1); }
                .mat-form-field-appearance-legacy .mat-form-field-underline { background-color: rgba(255, 255, 255, 0.42) !important; }
                .mat-select-arrow{ color: rgba(255, 255, 255, 0.54) !important;}
                .mat-calendar-body-today:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical){ border-color: rgba(255,255,255,.38) }
                .mat-calendar-body-cell-content, .mat-date-range-input-separator{ color: rgba(255, 255, 255, 0.87) !important; }
                .mat-button, .mat-icon-button, .mat-stroked-button{ color: white !important; }
                .mat-datepicker-content{ background: rgb(10, 10, 10) !important; }
                .mat-calendar-table-header, .mat-calendar-body-label { color: rgba(255, 255, 255, 0.54) !important; }
                .mat-calendar-table-header-divider::after { background-color: rgba(255, 255, 255, 0.12) !important; }
                .loading_white.mat-progress-spinner circle, .mat-spinner circle { stroke: #ffffff; }
                `;
               } else {
         css = `
         .color { color: #111 !important; } 
                .color1 { color: #333 !important; } 
                .color2 { color: #666 !important; } 
                .color3 { color: #999 !important; } 
                .color4 { color: #979797 !important; } 
                .valid > svg > circle { stroke: #333 !important; } 
                .mat-input-element::placeholder { color: rgba(0, 0, 0, .5) !important; }
                .background { background: rgb(255, 255, 255) !important; }
                .background1 { background: rgb(240, 240, 240) !important; }
                .background2 { background: rgb(220, 220, 220) !important; }
                .background3 { background: rgb(195, 195, 195) !important; }
                .background4 { background: rgb(135, 135, 135) !important; }
                .background5 { background: rgb(80, 80, 80) !important; }
                .background6 { background: rgb(30, 30, 30) !important; }
                .background3_invert { background: rgb(60, 60, 60) !important; }
                .mat-select-value{ color: rgba(0, 0, 0, 0.85) !important; }
                .mat-ripple-element { background-color: rgba(0, 0, 0, .1) }
                .mat-datepicker-toggle { color: rgba(0, 0, 0, .5) !important; }
                ::-webkit-scrollbar-track { background-color: rgb(255, 255, 255); }
                .mat-checkbox-frame { border-color: rgba(0, 0, 0, 0.54) !important; }
                ::-webkit-scrollbar-thumb { background-color: rgb(182, 182, 182); border-radius: 4px; }
                .mat-form-field-appearance-legacy .mat-form-field-label{ color: rgba(0, 0, 0, 0.54) !important;}
                .mat-form-field-appearance-legacy .mat-form-field-underline{ border-color: rgba(0, 0, 0, 0.42) !important; }
                .mat-form-field-appearance-legacy .mat-form-field-underline{ color: rgba(0, 0, 0, 0.2) !important; }   
                .alert-container > .mat-dialog-container .dialog__surface{ border-radius: 18px !important; background: rgb(255, 255, 255); padding: 0px; }
                .settings-container > .mat-dialog-container .dialog__surface{ border-radius: 18px !important; background: rgb(255, 255, 255); padding: 15px 20px; }
                .mat-slide-toggle-bar{ background-color: rgb(0 0 0 / 38%) }
                .asignUser > .mat-dialog-container{ border-radius: 16px; padding: 15px; background: rgba(242, 242, 242, 1); }
                .viewUser > .mat-dialog-container{ border-radius: 16px; padding: 5px; background: rgba(242, 242, 242, 1); }
                .mat-form-field-appearance-legacy .mat-form-field-underline { background-color: rgba(0, 0, 0, 0.42) !important; }
                .mat-select-arrow{ color: rgba(0, 0, 0, 0.54) !important;}
                .mat-calendar-body-today:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical){ border-color: rgba(0,0,0,.38) }
                .mat-calendar-body-cell-content, .mat-date-range-input-separator{ color: rgba(0, 0, 0, 0.87) !important; }
                .mat-button, .mat-icon-button, .mat-stroked-button{ color: #333 !important; }
                .mat-datepicker-content{ background: white !important; }
                .mat-calendar-table-header, .mat-calendar-body-label { color: rgba(0, 0, 0, 0.54) !important; }
                .mat-calendar-table-header-divider::after { background-color: rgba(0, 0, 0, 0.12) !important; }
                .loading_black.mat-progress-spinner circle, .mat-spinner circle { stroke: #000000; }
             `;
      }
      css += `
       input { caret-color: `+ this.dataUser.color_primary + ` !important; }
       .mat-form-field.mat-focused .mat-form-field-ripple{ background-color: `+ this.dataUser.color_primary + ` !important; }
       .mat-checkbox-indeterminate.mat-accent .mat-checkbox-background, .mat-checkbox-checked.mat-accent .mat-checkbox-background{ background-color: `+ this.dataUser.color_primary + ` !important; }
       .mat-slide-toggle.mat-checked .mat-slide-toggle-thumb{ background-color: `+ this.dataUser.color_primary + ` !important; }
       .mat-slide-toggle.mat-checked .mat-slide-toggle-bar{ background-color: `+ this.dataUser.color_secondary + ` !important; }
       .mat-tab:not(.mat-tab-disabled).tab--active .tab__text-label, .mat-tab-link:not(.mat-tab-disabled).tab--active .tab__text-label{ color: `+ this.dataUser.color_secondary + ` !important; };
       .mat-tab:not(.mat-tab-disabled).tab-indicator__content--underline,.mat-tab-link:not(.mat-tab-disabled).tab-indicator__content--underline{ border-color: `+ this.dataUser.color_secondary + ` !important; }
       .text_color { color: `+ this.dataUser.color_primary + ` !important; } 
       .mat-calendar-body-selected { background-color: `+ this.dataUser.color_primary + ` !important; }
       .mat-calendar-body-in-range::before { background: `+ this.dataUser.color_primary + ` !important; opacity: 0.2; }
       .bg_color { background: `+ this.dataUser.color_primary + ` !important; } 
       .border_top_color_2 { border-top: 2px solid `+ this.dataUser.color_primary + ` !important; } 
       .border_color_1 { border: 1px solid `+ this.dataUser.color_primary + ` !important; } 
       .border_top_color_3 { border-top: 3px solid `+ this.dataUser.color_primary + ` !important; } 
       .border_top_color_4 { border-top: 4px solid `+ this.dataUser.color_primary + ` !important; } 
       .bg_color_dark { background: `+ this.dataUser.color_secondary + ` !important; } 
       .btn_color{background: `+ this.dataUser.color_primary + `;height: 36px;padding: 0px 14px;border-radius: 6px;outline: none; cursor: pointer;transition: all ease-out .2s;border: none;color: white;cursor: pointer;} 
       .btn_color:hover, .btn_color:focus { background: `+ this.dataUser.color_secondary + `; } 
       .tab-indicator__content{ border-color: `+ this.dataUser.color_secondary + ` !important; }
       .mat-form-field.mat-focused .mat-form-field-label{ color: `+ this.dataUser.color_primary + ` !important; }
       .mat-primary .mat-option.mat-selected:not(.mat-option-disabled){ color: `+ this.dataUser.color_primary + ` !important; }
       .mat-form-field-appearance-outline.mat-focused .mat-form-field-outline-thick{ color: `+ this.dataUser.color_secondary + ` !important; } 
       .mat-slider.mat-accent .mat-slider-track-fill, .mat-slider.mat-accent .mat-slider-thumb, .mat-slider.mat-accent .mat-slider-thumb-label{ background-color: ${this.dataUser.color_primary} !important; }
       .mat-slider-thumb{ background-color: ${this.dataUser.color_secondary} !important; }
       `;
      if (style) {
         style.innerHTML = css
      } else {
         var styleElement = document.createElement("style");
         styleElement.id = "Theme";
         styleElement.innerHTML = css;
         document.head.appendChild(styleElement);
      }
   }

   static run() {
      this.dataUser = JSON.parse(localStorage.getItem('dataUser') ?? '{}')
      this.apps = JSON.parse(localStorage.getItem('apps') ?? '[]')
      this.theme = localStorage.getItem('theme') == 'true'
      newGlobalData.FontSize = Number(localStorage.getItem('FontSize'))
      newGlobalData.token = localStorage.getItem('token') ?? ''
      newGlobalData.dataUser = this.dataUser;
      this.loadTheme();
      const metaTag = document.querySelector('meta[name="theme-color"]');
      if (metaTag) { metaTag.setAttribute('content', this.dataUser.color_primary); }
   }

   public static logaut(router: Router) {
      var user = localStorage.getItem('user')
      var theme = localStorage.getItem('theme')
      localStorage.clear()
      if (user) localStorage.setItem('user', user)
      if (theme) localStorage.setItem('theme', theme)
      router.navigate(['../auth']) 
      return false
   }

   constructor() { }

}
