import { Component } from '@angular/core';
import {File} from '@ionic-native/file/ngx';
import{Media} from '@ionic-native/media/ngx';
import {Platform} from '@ionic/angular'
import { Musicdetail } from '../models/musicdetail';
import {Storage} from '@ionic/storage';
import { SateManager } from '../models/sate-manager';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import{ModalController} from '@ionic/angular';
import {DetailPage}from '../detail/detail.page';

declare var cordova:any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  files=[];
  music:Musicdetail;
  media:Media;
  file:any;
  track:string;
  track_path:string;
  state:string;
  nowPlaying:string;
  nowPalyingIndex:Number=0;
  durration:Number=0;
  currentPosition:Number=0;
  currentPositionVal:Number=0;
  durration_formatted:string="00:00";
  currentPosition_formatted:string="00:00:00";
  CanPlayNext:boolean=false;
  CanPlayBack:boolean=false;
  public stateManager:SateManager;

  constructor(private screenOrientation:ScreenOrientation,
    public modalCtr:ModalController,
     public myfile :File,
      public platform:Platform,
       public storage:Storage) {
    this.screenOrientation.lock('portrait');
    platform.ready().then(()=>{
      this.media=new Media();
      let index=0;

      let fs:string= cordova.file.externalRootDirectory; 
       myfile.checkDir(fs,'Music').then(_=>
         myfile.listDir(fs,'Music').then(data=>
          {
             data.filter(value=>{
             return value.name.substr(value.name.lastIndexOf('.')+1)=='mp3';
          }).forEach(entry=>{
            this.music=new Musicdetail();
            this.music.Name=entry.name;
            this.music.Path=entry.nativeURL;
            this.music.Key=this. CreateGuid();
            this.music.Index=index;
            this.files.push(this.music);
            index++;
           })
        })
      ).catch(err=>console.log(err));
    });
  }
  CreateGuid()  
   {  
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
         var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
          return v.toString(16);  
     });  
  }

  async TrackClick(path:string,key:string,name:string,index:Number){
   const currentState= await this.GetState();
   
   let newstate={
    Track:path,
    State:1,
    Repeat:0,
    Lapse:"0.00",
    key:key,
  };
    if(currentState){
      if(currentState.key==key){
        if(this.file){
          if(currentState.State==1){
          this.file.pause();
          newstate.State=2;
          }
          if(currentState.State==2){
            this.file.play();
            newstate.State=1;
            }
        }else{
          this.file= this.media.create(path);
          this.file.play();
        }
      }else{
        if(this.file)  this.file.stop();
        this.file= this.media.create(path);
        this.file.play();
      }
    }
    else{
      this.file= this.media.create(path);
      this.file.play();
    }
   await this.SaveState(newstate);
   await this.GetDuration();
   this.track=key;
   this.state=newstate.State.toString();
   this.nowPlaying=name;
   this.track_path=path;
   this.nowPalyingIndex=index;
   this.CanPlayNext= this.CanNext();
   this.CanPlayBack=this.CanBack();
   if(this.file){
     setInterval(async ()=>
     {
       if(this.file){
       await  this.file.getCurrentPosition().then((position) => {
          if(position=>0){
            this.currentPosition=position;
            this.currentPositionVal=position;
            this.currentPosition_formatted=this.formatSeconds(position);
          }
        });
      }
     },1000);
    }
    
}

 async GetState(){
    let res;
   await this.storage.get("MusicCurrentState").then((data)=>{
      if(data){   
        res= data;
      }
    }).catch((err)=>{
      console.log(err);
    });
    return res;
  }
  async SaveState(value:any){
   await this.storage.set("MusicCurrentState",value).catch((err)=>{
      console.error(err);
    });
  }
  async GetDuration(){
    if(this.file){
       let seconds=  await this.file.getDuration();
       if(seconds>0){
         this.durration=seconds;
         this.durration_formatted=this.formatSeconds(seconds);
       }
    }
  }
  async SlideChange(){
    if(this.file){
       let pos=parseFloat(this.currentPosition.toString());
       if(this.currentPosition!=this.currentPositionVal)  this.file.seekTo(pos*1000);
    }
  }
  formatSeconds(seconds){
    let date=new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11,8);
  }
 async Next(){
    let next=parseInt(this.nowPalyingIndex.toString())+1;
    if(this.CanNext()){
      let nextItem=this.files[next];
     await this.TrackClick(nextItem.Path,nextItem.Key,nextItem.Name,nextItem.Index)
    }
  }
  async Back(){
    let prev=parseInt(this.nowPalyingIndex.toString())-1;
    if(this.CanBack()){
      let nextItem=this.files[prev];
     await this.TrackClick(nextItem.Path,nextItem.Key,nextItem.Name,nextItem.Index)
    }
  }
  CanNext(){
    let lastIndex=this.files.length -1;
    let nextPlay=parseInt(this.nowPalyingIndex.toString())+1;
    return nextPlay <= lastIndex;
  }
  CanBack(){
    
    let prev=parseInt(this.nowPalyingIndex.toString())-1;
    return (parseInt(prev.toString()) >parseInt( '-1'));
  }
  async presentModal(){
    const modal=await this.modalCtr.create({
      component:DetailPage
    });
    return await modal.present();
  }
}
