import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPageRootComponent } from './control-page-root/control-page-root.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ControlNavbarComponent } from './control-navbar/control-navbar.component';
import { ScenariosComponent } from './scenarios/scenarios.component';

@NgModule({
  imports: [
    CommonModule,
    MatTabsModule
  ],
  declarations: [ControlPageRootComponent, ControlNavbarComponent, ScenariosComponent],
  exports: [ControlPageRootComponent]
})
export class ContorlPageModule { }
