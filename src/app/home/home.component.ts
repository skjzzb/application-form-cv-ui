import {  Component, OnInit, Input, Output, EventEmitter,ViewChild,ElementRef} from '@angular/core';
import { DataService } from '../service/data.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, window } from 'rxjs/operators';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  //class variables
  selectedItem = '';
  radioGroupValue = 'Self-Employed';

  vacancyId : number;
  job_desc: any;
  job_summury : any;

  array : any;
  filtered : any;
  candidate : any;

  model: any = {};

  fileToUpload: File = null;
  formData = new FormData();
  maxFileSize = 1048576;

   @Input() accept = 'application/pdf,application/msword';
   
   @ViewChild("fileUpload", {static: false})
    fileUpload: ElementRef;
    files  = [];  

  constructor( private service: DataService ,
                private router :Router) {
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

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if(this.fileToUpload != null && this.fileToUpload.size > this.maxFileSize)
    {
      console.log(this.fileToUpload.size);
      alert("please choose file within 1 MB size");
      this.fileUpload.nativeElement.value = null;
      this.fileToUpload = null;
    }
    console.log(this.fileToUpload);
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
    this.formData.append('file', this.fileToUpload,fileName);
    // this.formData.append('filename',fileName);
    this.service.upload(this.formData).
                subscribe((event: any) => {  
            if (typeof (event) === 'object') {  
              console.log(event.body);  
            }  
          });   
          this.onCancel(dataFromUI);   
  })
  
}

onCancel(dataFromUI:any)
{
  dataFromUI.reset();
  this.selectedItem = "";
  this.job_desc = null;
  this.job_summury = null;
  this.formData.delete('file');
  this.fileToUpload = null;
  this.fileUpload.nativeElement.value = null;
}

}



// https://cv-processing-api.herokuapp.com/v1/candidiate/