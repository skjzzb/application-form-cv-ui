import {  Component, OnInit, Input, Output, EventEmitter,ViewChild,ElementRef} from '@angular/core';
import { DataService } from '../service/data.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  //class variables
  selectedItem = '';
  vacancyId : number;
  job_desc: any;
  job_summury : any;
  array : any;
  filtered : any;
  radioGroupValue = 'Self-Employed';
  candidate : any;
  model: any = {};

   @Input() accept = 'application/pdf,application/msword';

   @ViewChild("fileUpload", {static: false})
    fileUpload: ElementRef;
    files  = [];  

  constructor( private service: DataService ) {
  }

  ngOnInit(): void {

    this.retrieveVacancies();
    this.candidate = {id:0,candidateName:" ",email:" ",contactNo:" ",employmentStatus:" "};
  }
  
  retrieveVacancies()
  {
    this.service.getVacancies().subscribe(
      result => {

        this.array = result;
        this.filtered = this.array.map(function(vacancy){
          return {id:vacancy.vacancyId, value:vacancy.jobTitle};
        }) 
        console.log(this.filtered);
      }
    )
  }

onSelect(id: number)
{
  this.vacancyId =id;
  this.service.getVacancyDetails(this.vacancyId).subscribe(result=>
    {
      console.log(result);
      this.job_desc = result['jd'];
      this.job_summury = result['shortSummary'];
      console.log(this.job_desc);
    })
}

apply(dataFromUI:any)
{
  let form = dataFromUI.form.value;
  

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  let day = mm + '-' + dd + '-' + yyyy;
  console.log(day);

  let position = this.selectedItem.replace(" ","-");
  form.firstName = form.firstName.replace(/[^a-zA-Z ]/g, "");
  form.lastName =  form.lastName.replace(/[^a-zA-Z ]/g, "");

  let fileName = position.concat("_",form.firstName,"_",form.lastName,"_",day,".pdf");
  
  this.candidate['candidateName'] = form.firstName.concat(" ",form.lastName)
  this.candidate['contactNo'] = form['mobile'];
  this.candidate['email'] = form['email'];
  this.candidate['employmentStatus'] = this.radioGroupValue;
  console.log(this.candidate);

  this.service.createCandidate(this.candidate,this.selectedItem).subscribe(result=>
  {
    console.log(result);
    
    const fileUpload = this.fileUpload.nativeElement;
    for (let index = 0; index < fileUpload.files.length; index++)  
    {  
      const file = fileUpload.files[index];  
      this.files.push({ data: file, inProgress: false, progress: 0});  
    }  
    this.uploadFiles(fileName);   
    this.onCancel(dataFromUI);
  })
  
}

onCancel(dataFromUI:any)
{
  dataFromUI.reset();
  this.selectedItem = "";
  this.job_desc = null;
  this.job_summury = null ;
  this.fileUpload.nativeElement.value = "";
}

uploadFile(file,fileName) {  
  const formData = new FormData();  
  formData.append('file', file.data,fileName);  
  file.inProgress = true;  
  this.service.upload(formData).pipe(  
    map(event => {  
      switch (event.type) {  
        case HttpEventType.UploadProgress:  
          file.progress = Math.round(event.loaded * 100 / event.total);  
          break;  
        case HttpEventType.Response:  
          return event;  
      }  
    }),  
    catchError((error: HttpErrorResponse) => {  
      file.inProgress = false;  
      return of(`${file.data.name} upload failed.`);  
    })).subscribe((event: any) => {  
      if (typeof (event) === 'object') {  
        console.log(event.body);  
      }  
    });  
}

uploadFiles(fileName) {  
  this.fileUpload.nativeElement.value = '';  
  this.files.forEach(file => {  
    this.uploadFile(file,fileName);  
  });  
}

//   addVacancy(dataFromUI:any)
//   {
//     //this.ngOnInit();
//   let vacancy=dataFromUI.form.value;
//   //vacancy.jd=vacancy.jd.toString()
//   console.log(vacancy);
//    this.service.addVacancy(vacancy)
//    .then(
//      Response => {
//       if (window.confirm("vacancy is added. do you want to add more record ?"))
//       {
//         this.selectedItem=null;
//         //this.selectedtechnology=null;
//         this.ClickedSubtechnology=null;
//         dataFromUI.form.reset();
//       }else
//       {
//         this.router.navigate(['/pages/vacancy/list-of-vacancy']);
//       }
//       //this.ngOnDestroy()
//       //this.ngOnInit()
//       //window.location.reload()
//     }
//    )
// }
}

export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}

// https://cv-processing-api.herokuapp.com/v1/candidiate/