import { DragDropModule } from "@angular/cdk/drag-drop";
import { HttpClientModule } from "@angular/common/http";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule, MatRippleModule } from "@angular/material/core";
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSliderModule } from "@angular/material/slider";
import { MatStepperModule } from "@angular/material/stepper";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { NgModule } from "@angular/core";

import {MatBadgeModule} from '@angular/material/badge';
import { MatDialogModule } from "@angular/material/dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

  @NgModule({
    exports: [
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatStepperModule,
        MatSliderModule,
        MatInputModule,
        MatAutocompleteModule,
        MatRippleModule,
        MatTabsModule,
        MatBadgeModule,
        MatRadioModule,
        FormsModule,
        MatCheckboxModule,
        HttpClientModule,
        DragDropModule,
        MatProgressBarModule,
        MatSelectModule,
        MatMenuModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
    ]
  })
  export class MaterialModule {}