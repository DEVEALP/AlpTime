import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-employe-family',
  templateUrl: './employe-family.component.html',
  styleUrls: ['./employe-family.component.css']
})
export class EmployeFamilyComponent {

  loading = false;
  parentezcos:string[] = ['Conjuge', 'Hijo', 'Hija', 'Padre', 'Madre', 'Hermano', 'Hermana', 'Otro'];
  family = new FormGroup({
    id: new FormControl(null),
    userid: new FormControl(null),
    nombres: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚüÜ ]*$')]),
    apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚüÜ ]*$')]),
    cedula: new FormControl('', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]),
    parentezco: new FormControl('', [Validators.required]),
    fecha_nac: new FormControl<Date | null>(null, [Validators.required]),
  });

  constructor(public dialogRef: MatDialogRef<EmployeFamilyComponent>, @Inject(MAT_DIALOG_DATA) public data:any, private http:newHttpRequest, private home:HomeService) {}

  ngOnInit(): void {
    if(this.data.userid){
      this.family.controls.userid.setValue(this.data.userid);
      if(this.data.family?.id){
        this.family.controls.id.setValue(this.data.family?.id);
        this.family.controls.nombres.setValue(this.data.family?.nombres);
        this.family.controls.apellidos.setValue(this.data.family?.apellidos);
        this.family.controls.cedula.setValue(this.data.family?.cedula);
        this.family.controls.parentezco.setValue(this.data.family?.parentezco);
        if(this.data.family?.fecha_nac){
          var date_parts = this.data.family?.fecha_nac.split('-');
          var fecha_nac = new Date(Number(date_parts[2]), Number(date_parts[1]) - 1, Number(date_parts[0]));
          this.family.controls.fecha_nac.setValue(fecha_nac);
        }
      }
    }else{
      this.cancel();
    }
  }

  save(){
    if(this.family.controls.nombres.invalid){
      this.home.toast.fire({icon:'error', title:'Nombre invalido'});
      return
    }
    if(this.family.controls.apellidos.invalid){
      this.home.toast.fire({icon:'error', title:'Apellido invalido'});
      return
    }
    if(this.family.controls.cedula.invalid){
      this.home.toast.fire({icon:'error', title:'Cedula invalida'});
      return
    }
    if(this.family.controls.parentezco.invalid){
      this.home.toast.fire({icon:'error', title:'Parentezco invalido'});
      return
    }
    if(this.family.controls.fecha_nac.invalid){
      this.home.toast.fire({icon:'error', title:'Fecha de nacimiento invalida'});
      return
    }
    if(!this.loading){
      this.loading = true;
      var body = JSON.parse(JSON.stringify(this.family.value));
      body.fecha_nac = new Date(body.fecha_nac).toISOString().split('T')[0];
      body.id = body.id ?? 0;
      this.http.post('employes/family/set', body, ['object1']).then((res:any)=>{
        body.id = Number(res.value);
        this.loading = false
        this.dialogRef.close({action: 'add', data:body});
      }).catch((err:any)=>{
        this.loading = false
      })
    }
  }

  remove(){
    this.home.alert({icon:'warning', title:'Eliminar', text:'¿Desea eliminar este familiar?, este proceso no se puede deshacer'}).then((result:any)=>{
      this.http.get('employes/family/delete?userid='+this.family.controls.userid.value+'&id='+this.family.controls.id.value).then((res:any)=>{
        this.home.toast.fire({icon:'success', title:'Informacion eliminada correctamente'});
        this.dialogRef.close({action: 'delete', data:null});
      }).catch((err:any)=>{
        this.home.toast.fire({icon:'error', title:'Error al eliminar la informacion'});
      })
    })
  }

  cancel(){
      this.dialogRef.close();
  }

}
