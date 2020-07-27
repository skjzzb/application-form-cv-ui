import { Injectable } from '@angular/core';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';


//http://authentication-api-cv.herokuapp.com/api/user/10
const API_URL = 'https://cv-processing-api.herokuapp.com/v1';
const API_URL1 = "http://localhost:8081/v1";

@Injectable({
  providedIn: 'root'
})

export class DataService {

  SERVER_URL: string = " https://application-form-processing.herokuapp.com/uploadprofile";  
  logindetails : any
  token : any
 
  constructor(private http: HttpClient) { 
  
  }
  
  public upload(formData) {

    return this.http.post<any>(this.SERVER_URL, formData, {  
        reportProgress: true,  
        observe: 'events'  
      });  
  }

  createCandidate(candidate,id)
  {
    return this.http.put("https://cv-processing-api.herokuapp.com/v1/candidiate/"+id,candidate);
  }
  getVacancyDetails(id)
  {
    return this.http.get("https://cv-processing-api.herokuapp.com/v1/vacancy/"+id);
  }

  getVacancies()
  {
    return this.http.get("https://cv-processing-api.herokuapp.com/v1/vacancy?sort=avalible");
  }
}



    

     

      


