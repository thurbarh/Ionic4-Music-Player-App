import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {File} from '@ionic-native/file/ngx'; 
import {Media} from '@ionic-native/media/ngx';
import {IonicStorageModule} from '@ionic/storage';
import{ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import {DetailPage} from './detail/detail.page';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { from } from 'rxjs';
@NgModule({
  declarations: [AppComponent,DetailPage],

  entryComponents: [DetailPage],

  imports: [
    BrowserModule, 
    IonicModule.forRoot(),
     AppRoutingModule,
     IonicStorageModule.forRoot({
       name:'_MuzicApp',
       
     })],

  providers: [
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    File,
    Media,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],

  bootstrap: [AppComponent]
})
export class AppModule {}
