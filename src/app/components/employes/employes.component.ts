import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-employes',
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.css']
})
export class EmployesComponent {

  loading = true
  loadFilter = false
  filtercount = 0
  employes:any[] = []

  constructor(private http:newHttpRequest, private home:HomeService, private dialog:MatDialog, private router:Router) { }

  ngOnInit(): void {
    this.load()
  }

  setFilter(){

  }

  viewEmploye(id:number){
    this.router.navigate(['/employes/'+id])
  }
  
  load(){
    this.loading = true
    this.http.post('employes/get', {id: 0, value: ''}).then((res:any)=>{
      this.employes = res
      this.loading = false
      console.log(res)
    }).catch((err:any)=>{
      this.loading = false
      this.home.toast.fire({icon: 'error', title: 'Error al cargar los empleados'})
    })
  }

  add(){
    this.router.navigate(['/employes/0'])
  }


}
