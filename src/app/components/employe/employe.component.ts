import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';
import { EmployesService } from 'src/app/services/employes.service';
import { Observable, map, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EmployeFamilyComponent } from '../employe-family/employe-family.component';
import { EmployeBiometricComponent } from '../employe-biometric/employe-biometric.component';
import { DeviceService } from 'src/app/services/device.service';
import { UserEditComponent } from '../user-edit/user-edit.component';

@Component({
  selector: 'app-employe',
  templateUrl: './employe.component.html',
  styleUrls: ['./employe.component.css']
})
export class EmployeComponent {

  title = ' '
  birthday_text = ''
  states_reponse:any[] = [ {codigo: false, nombre: 'No'}, {codigo: true, nombre: 'Si'} ]
  tab = 'info'
  app_tab = 1
  loading = false 
  disabled_btn_add_biometric = false
  imagen = ''
  tumblr =''
  sexs:any[] = []
  job: any = []
  office: any = []
  groups: any = []
  ecivils:any[] = []
  family:any[] = []
  all_biometrics:any[] = []
  biometrics:any[] = []
  estudios:any[] = []
  apps:any[] = []
  mobile = window.innerWidth < 750
  heigth = window.innerHeight
  settings_app:any = {see_markings: true}
  elaboral:any[] = [ {codigo: false, nombre: 'Inactivo'}, {codigo: true, nombre: 'Activo'} ]
  tpcontra:any[] = [ ]
  filteredOptions:any
  employe_app = new FormGroup({
    id: new FormControl<number>(0),
    userid: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]),
    password: new FormControl<string>('', [Validators.minLength(5), Validators.maxLength(15)]),
    allow: new FormControl<boolean>(true),
    view_data: new FormControl<boolean>(true),
  })
  employe = new FormGroup({
    id: new FormControl<number | null>(0),
    nombre: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]*$/)]),
    apellido: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]*$/)]),
    cedula: new FormControl<string>('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[0-9\s]*$/)]),
    userid: new FormControl<number | string | null>(null, [Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(/^[0-9\s]*$/)]),
    brithday: new FormControl<Date | null>(null, [Validators.required]),
    brithday_view: new FormControl<string>(''),
    estudio: new FormControl<string>(''),
    sexo: new FormControl<string>('', [Validators.required]),
    ecivil: new FormControl<string>(''),
    telefono: new FormControl<string>('', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[0-9\s]*$/)]),
    email: new FormControl<string>('', [Validators.email]),
    direccion: new FormControl<string>(''),
    allow: new FormControl<boolean>(false),
    overtime: new FormControl<boolean>(true),
    fecha_ing: new FormControl<Date | null>(null),
    fecha_ing_view: new FormControl<string>(''),
    fecha_sal: new FormControl<Date | null>(null),
    tp_contra: new FormControl<string>(''),
    cargo: new FormControl<string>(''),
    departament: new FormControl<string>(''),
    grupo: new FormControl<string>(''),
    motivo_sal: new FormControl<string>(''),
  })
  settings:any = {}
  filteredOptionsDepartaments: Observable<any[]> | undefined;
  filteredOptionsJobs: Observable<any[]> | undefined;
  filteredOptionsGroups: Observable<any[]> | undefined;
  setDataSelect = false
  scroll_biometrics = false

  constructor(private http:newHttpRequest, private home:HomeService, private activedRoute:ActivatedRoute, private router:Router, private employesvc:EmployesService, private dialog:MatDialog, private devicesvc:DeviceService) { }

  ngOnInit(): void {
    newGlobalData.run()
    this.apps = newGlobalData.apps
    var params:any = this.activedRoute.snapshot.params 
    if(!params){
      this.router.navigate(['/employes'])
      return
    }else{
      if(params.id > 0){
        this.employe.controls.id.setValue(params.id)
        if(this.employesvc.employe.id > 0 && this.employesvc.employe.userid > 0){
          this.employe.setValue(this.employesvc.employe)
          this.title = this.employe.controls.nombre.value + ' ' + this.employe.controls.apellido.value
        }else{
          this.load_info()
        }

      }else{
        this.title = 'Nuevo'
      }
      var app:any = newGlobalData.apps.find((e:any)=>e.route_path == 'employes')
      if(app) try { this.settings = JSON.parse(app.settings) } catch (error) {}
      if(this.settings.auto_key == true || this.settings.auto_key == null){
        this.employe.controls.userid.disable()
        this.employe.controls.userid.setValue('Automatica')
      }
//      this.employe.controls.userid.disable()
      this.getTypes()
      this.getFilters()
    }
  }

  validdateString(event:any, control_name:string){
    var value = event.target.value
    var controls:any = this.employe.controls
    var control = controls[control_name]
    if(value.length != 10){
      control?.setValue(null)
      control?.setErrors({required: true})
      this.home.toast.fire({icon:'error', title:'Fecha invalida'})
      return
    }
    var date_split = value.split('/')
    if(date_split.length != 3){
      control?.setValue(null)
      control?.setErrors({required: true})
      this.home.toast.fire({icon:'error', title:'Fecha invalida'})
      return
    }
    var date:any = new Date(date_split[2] + '-' + date_split[1] + '-' + date_split[0] + 'T05:00:00')
    if(date == 'Invalid Date'){
      control?.setValue(null)
      control?.setErrors({required: true})
      this.home.toast.fire({icon:'error', title:'Fecha invalida'})
      return
    }
    control?.setValue(date)
    control?.setErrors(null)
  }

  selectDate(event:any, control_name:string){
    var controls:any = this.employe.controls
    var control = controls[control_name]
    var date_split = event.value.toISOString().split('T')[0].split('-')
    var date_string = date_split[2] + '/' + date_split[1] + '/' + date_split[0]
    control?.setValue(date_string)
  }

  validSelection(type:string){
    if(type == 'departament'){
      var existe = this.office.find((e:any)=>e.nombre == this.employe.controls.departament.value)
      if(existe) this.employe.controls.departament.setValue(existe.nombre)
      else this.employe.controls.departament.setValue('')
    }else if(type == 'cargo'){
      var existe = this.job.find((e:any)=>e.nombre == this.employe.controls.cargo.value)
      if(existe) this.employe.controls.cargo.setValue(existe.nombre)
      else this.employe.controls.cargo.setValue('')
    }else if(type == 'grupo'){
      var existe = this.groups.find((e:any)=>e.nombre == this.employe.controls.grupo.value)
      if(existe) this.employe.controls.grupo.setValue(existe.nombre)
      else this.employe.controls.grupo.setValue('')
    }
  }

  async getFilters() {
    await this.getGroups()
    await this.getOptions()
    this.setDataForm()
    this.filteredOptionsDepartaments = this.employe.controls.departament.valueChanges.pipe(startWith(''), map(value => this._filter(this.office, 'nombre', value)));
    this.filteredOptionsJobs = this.employe.controls.cargo.valueChanges.pipe(startWith(''), map(value => this._filter(this.job, 'nombre', value)));
    this.filteredOptionsGroups = this.employe.controls.grupo.valueChanges.pipe(startWith(''), map(value => this._filter(this.groups, 'nombre', value)));
  }

  private _filter(data: any[], proeprty: string, value?: string | null): string[] {
    const filterValue = value?.toLowerCase() ?? '';
    return data.filter((option: any) => option[proeprty]?.toLowerCase()?.includes(filterValue));
  }
  
  getOptions = () => new Promise<void>((resolve, reject) => {
    this.http.get('device/options/get').then((e: any) => {
      for (let x of e) {
        if (x.tipo == "Cargo") this.job.push(x)
        if (x.tipo == "Oficina") this.office.push(x)
      }
      resolve()
    }).catch(() => {
      reject()
    })
  })

  getGroups = () => new Promise<void>((resolve, reject) => {
    this.http.get('device/groups/get?value=').then((e: any) => {
      this.groups = e
      resolve()
    }).catch(() => {
      reject()
    })
  })

  load_info(){
    this.loading = true
    this.http.get('employes/get?id='+this.employe.controls.id.value).then((res:any)=>{
      if(res && res.length > 0){
        this.tumblr = res[0]?.imagen ?? ''
        this.employe.controls.userid.setValue(res[0].userid)
        this.employe.controls.nombre.setValue(res[0].nombre)
        this.employe.controls.apellido.setValue(res[0].apellido)
        this.employe.controls.cedula.setValue(res[0].cedula)
        this.employe.controls.estudio.setValue(res[0]?.estudio ?? '')
        this.employe.controls.sexo.setValue(res[0].sexo)
        this.employe.controls.ecivil.setValue(res[0].ecivil)
        this.employe.controls.telefono.setValue(res[0].telefono)
        this.employe.controls.estudio.setValue(res[0].studies)
        this.employe.controls.email.setValue(res[0].email)
        this.employe.controls.direccion.setValue(res[0]?.direccion ?? '')
        this.employe.controls.allow.setValue(res[0].allow ?? false)
        if(res[0].brithday){
          this.employe.controls.brithday.setValue(new Date(res[0].brithday))
          var date_split = res[0].brithday.split('T')[0].split('-')
          this.employe.controls.brithday_view.setValue(date_split[1] + '/' + date_split[0] + '/' + date_split[2])
        }
        if(res[0].fecha_ing){
          this.employe.controls.fecha_ing.setValue(new Date(res[0].fecha_ing))
          var date_split = res[0].fecha_ing.split('T')[0].split('-')
          this.employe.controls.fecha_ing_view.setValue(date_split[1] + '/' + date_split[0] + '/' + date_split[2])
        }
        if(res[0].fecha_sal) this.employe.controls.fecha_sal.setValue(new Date(res[0].fecha_sal))
        this.employe.controls.tp_contra.setValue(res[0].tp_contra)
        this.employe.controls.cargo.setValue(res[0].cargo ?? '')
        this.employe.controls.departament.setValue(res[0].dpto ?? '')
        this.employe.controls.grupo.setValue(res[0].grupo ?? '')
        this.employe.controls.motivo_sal.setValue(res[0].motivo_sal)
        this.title = res[0].nombre + ' ' + res[0].apellido
        this.imagen = res[0].imagen
        this.employe.controls.userid.disable()
        if(!res[0].fecha_ing) this.employe.controls.allow.disable()
        this.employe.controls.motivo_sal.disable()
        this.employe.controls.fecha_sal.disable()
        if(res[0].account_id){
          this.app_tab = 2
          this.employe_app.controls.id.setValue(res[0].account_id)
          this.employe_app.controls.allow.setValue(res[0].allow_app)
          this.employe_app.controls.userid.setValue(res[0].userid_app)
          try{ 
            this.settings_app = JSON.parse(res[0].settings) 
            this.employe_app.controls.view_data.setValue(this.settings_app.see_markings)
          }catch(e){}
        }
        this.setDataForm()
        // this.open_tab('biometric')
        //this.employe.setValue(res[0])
      }else{
        this.home.toast.fire({icon:'error', title:'Empleado no encontrado'})
        this.router.navigate(['/employes'])
      }
      this.loading = false
    }).catch((err:any)=>{
      this.home.toast.fire({icon:'error', title:'Error al cargar el empleado'})
      this.router.navigate(['/employes'])
    })
  }

  open_tab(tab:string){
    this.tab = tab
    this.app_tab = 1
    if(tab == 'family' && this.family.length == 0) this.load_family()
    else if(tab == 'biometric' && this.all_biometrics.length == 0) this.getBiometrics()
  }

  load_family(){
    this.loading = true
    this.http.get('employes/family/get?userid='+this.employe.controls.userid.value).then((res:any)=>{
      this.loading = false
      this.family = res
      if(res.length > 0) this.app_tab = 2
    }).catch((err:any)=>{
      this.loading = false
      this.home.toast.fire({icon:'error', title:'Error al cargar la familia'})
    })
  }

  setDataForm(){
    if(!this.setDataSelect && this.groups.length > 0 && (this.employe.controls.id.value ?? 0) > 0){
      if(this.employe.controls.grupo.value){
        var existe = this.groups.find((e:any)=>e.codigo == this.employe.controls.grupo.value)
        if(existe) this.employe.controls.grupo.setValue(existe.nombre)
        else this.employe.controls.grupo.setValue('')
      }
      if(this.employe.controls.departament.value){
        var existe = this.office.find((e:any)=>e.codigo == this.employe.controls.departament.value)
        if(existe) this.employe.controls.departament.setValue(existe.nombre)
        else this.employe.controls.departament.setValue('')
      }
      if(this.employe.controls.cargo.value){
        var existe = this.job.find((e:any)=>e.codigo == this.employe.controls.cargo.value)
        if(existe) this.employe.controls.cargo.setValue(existe.nombre)
        else this.employe.controls.cargo.setValue('')
      }
      this.setDataSelect = true
    }
  }

  enable_app(){
    if(this.employe.controls.allow.value == true){
      if(this.employe.controls.email.value != '' && this.employe.controls.email.valid) this.home.alert({icon:'info', title: 'Enviar credenciales', text: 'Desea enviar las credenciales al correo del empleado?', width:350, text_button:'Enviar', value_button:'send', button: {text: 'No enviar', value:'no_send'}}).then((resp)=>{ this.setUserApp(resp == 'send') })
      else this.setUserApp(false)
    }
  }

  setUserid(){
    if(!this.employe.controls.id.value && this.settings.auto_key == false) try { this.employe.controls.userid.setValue(Number(this.employe.controls.cedula.value)) } catch (error) {}
  }

  setUserApp(send:boolean){
    var body = {userid: this.employe.controls.userid.value, value: this.home.tGenerate(10), action: 'enable', send: send}
    this.loading = true
    this.http.post('employes/app/settings', body, ['object1']).then((res:any)=>{
      this.loading = false
      this.home.toast.fire({icon:'success', title:'Aplicacion habilitada con exito'})
      this.employe_app.controls.id.setValue(res.account_id)
      this.employe_app.controls.userid.setValue(res.userid)
      this.employe_app.controls.allow.setValue(true)
      this.employe_app.controls.password.setValue(body.value)
      this.app_tab = 2
    }).catch((err:any)=>{
      this.loading = false
    })
  }

  setEnablegApp(e:any){
    this.loading = true
    var body = {action:'disable', userid: this.employe_app.controls.id.value, value: this.employe_app.controls.allow.value?.toString()}
    this.http.post('employes/app/settings', body, ['object1']).then((res:any)=>{
      this.loading = false
    }).catch((err:any)=>{
      this.employe_app.controls.allow.setValue(!this.employe_app.controls.allow.value)
      this.loading = false
    })
  }

  setConfigApp(e:any){
    this.settings_app.see_markings = e.checked
    this.loading = true
    var body = {action:'settings', userid: this.employe_app.controls.id.value, value: JSON.stringify(this.settings_app)}
    this.http.post('employes/app/settings' , body, ['object1']).then((res:any)=>{
      this.loading = false
    }).catch((err:any)=>{
      this.settings_app.see_markings = !this.settings_app.see_markings
      this.employe_app.controls.view_data.setValue(this.settings_app.see_markings)
      this.loading = false
    })
  }

  setUpdateDataApp(){
    this.loading = true
    var body = {action:'update', userid: this.employe_app.controls.id.value, value: this.employe_app.controls.password.value, nick: this.employe_app.controls.userid.value}
    this.http.post('employes/app/settings' , body, ['object1']).then((res:any)=>{
      this.loading = false
      this.home.toast.fire({icon:'success', title:'Datos actualizados con exito'})
    }).catch((err:any)=>{
      this.settings_app.see_markings = !this.settings_app.see_markings
      this.employe_app.controls.view_data.setValue(this.settings_app.see_markings)
      this.loading = false
    })
  }

  getTypes(){
    this.http.get('employes/types/all').then((res:any)=>{
      this.sexs = res.filter((e:any)=>e.type == 'sexos')
      this.ecivils = res.filter((e:any)=>e.type == 'ecivil')
      this.estudios = res.filter((e:any)=>e.type == 'estudios')
      this.tpcontra = res.filter((e:any)=>e.type == 'contratos')
    }).catch((err:any)=>{})
  }

  validUserid(){
    if(this.employe.controls.userid.invalid) return
    this.http.get('employes/valid/userid?userid='+this.employe.controls.userid.value).then((res:any)=>{
      if(res.length > 0){
        this.home.toast.fire({icon:'error', title:'El userid ya existe'})
        this.employe.controls.userid.setValue(null)
      }
    }).catch((err:any)=>{})
  }

  uploadFile(e: any) {
    var files = e.target.files
    if (files.length > 0) {
      if (files[0].type == "image/jpeg" || files[0].type == "image/png" || files[0].type == "image/jpg") {
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
          var image: any = fileReader.result;
          let img = new Image();
          img.src = image
          img.onload = () => {
            var width = img.width;
            var height = img.height;
            this.imagen = this.home.createImage(img, width, height, 300, 300);
            this.tumblr = this.home.createImage(img, width, height, 50, 50);
            this.saveImage()
          }
        }
        fileReader.readAsDataURL(files[0]);
      } else {
        this.home.toast.fire({ icon: 'error', title: 'Formato de imagen incompatible' })
      }
    }
  }

  saveImage(){
    this.employe.controls.userid.enable()
    var body = JSON.parse(JSON.stringify(this.employe.value))
    this.employe.controls.userid.disable()
    body.imagen = this.imagen
    body.tumblr = this.tumblr
    body.brithday = new Date(body.brithday).toISOString().split('T')[0]
    body.action = 'image'
    this.http.post('employes/set_info', body, ['object1']).then((res:any)=>{
      this.home.toast.fire({icon:'success', title:'Imagen guardada con exito'})      
    }).catch((err:any)=>{
      this.tumblr = ''
      this.imagen = ''
    })
  }

  setFamily(family?:any){
    var dialog = this.dialog.open(EmployeFamilyComponent, {data: {userid: this.employe.controls.userid.value, family:family}, width: '340px', height: 'auto', disableClose:true, panelClass: 'asignUser'})
    dialog.afterClosed().subscribe((res:any)=>{
      if(res){
        if(family){
          var index = this.family.findIndex((e:any)=>e.id == family.id)
          if(res.action == 'add'){
            if(index >= 0) this.family[index] = res.data
          }else{
            if(index >= 0) this.family.splice(index, 1)
          }
        }else this.family.push(res.data)
      }
    })
  }

  
  save_work(){
    //set_work
    if(this.employe.controls.fecha_ing.value == null){
      this.home.toast.fire({icon:'error', title:'Fecha de ingreso invalida'})
      return
    }
    if(!this.employe.controls.tp_contra.value){
      this.home.toast.fire({icon:'error', title:'Tipo de contrato invalido'})
      return
    }
    if(!this.employe.controls.departament.value){
      this.home.toast.fire({icon:'error', title:'Departamento invalida'})
      return
    }
    var exist_dpto = this.office.find((e:any)=>e.nombre == this.employe.controls.departament.value)
    var exist_cargo = this.job.find((e:any)=>e.nombre == this.employe.controls.cargo.value)
    var exist_grupo = this.groups.find((e:any)=>e.nombre == this.employe.controls.grupo.value)
    this.loading = true
    this.employe.controls.userid.enable()
    var body = JSON.parse(JSON.stringify(this.employe.value))
    body.fecha_ing = new Date(body.fecha_ing).toISOString().split('T')[0]
    body.grupo = exist_grupo ? exist_grupo.codigo : ''
    body.departament = exist_dpto ? exist_dpto.codigo : ''
    body.cargo = exist_cargo ? exist_cargo.codigo : ''
    this.employe.controls.userid.disable()
    this.http.post('employes/set_work', body).then((res:any)=>{
      if(res.length > 0){
        if(res[0].code == 200){
          this.home.toast.fire({icon:'success', title:'Guardado con exito'})
        }else{
          this.home.toast.fire({icon:'error', title:res[0].message})
        }
      }else{
        this.home.toast.fire({icon:'error', title:'Error al guardar el empleado'})
      }
      this.loading = false
    }).catch((err:any)=>{
      this.loading = false
    })
  }
  deleteBiometric(biometric:any){
    this.home.alert({icon:'warning', title:'Eliminar empleado del biometrico', text:'Si se elimina al empleado, ya no podrá registrar más entradas. Sin embargo, las marcaciones anteriores no se perderán.'}).then((resp:any)=>{
      this.loading = true
      var body = {action: 'delete', id: 0, deviceid: biometric.id, userid: Number(this.employe.controls.userid.value), name: '', password: '', card: '', type: 0, valid: 0}
      this.http.post('device/users/options', body).then((res: any) => {
        this.loading = false
        this.home.toast.fire({ icon: 'success', title: 'Eliminado correctamente' })
        var index = this.all_biometrics.findIndex((e:any)=>e.userid == biometric.userid && e.id == biometric.id)
        if(index >= 0){
          this.all_biometrics[index].userid = null
          this.biometrics = this.all_biometrics.filter((e:any)=>e.userid)
          if(this.biometrics.length == 0) this.app_tab = 1
          else this.app_tab = 2          
          this.disabled_btn_add_biometric = (this.biometrics.length - this.all_biometrics.length) == 0
        }
      }).catch((err: any) => {
        this.loading = false
      })
    })
  }

  save_info(){
    if(this.employe.controls.nombre.invalid){
      this.home.toast.fire({icon:'error', title:'Nombre invalido'})
      return
    }
    if(this.employe.controls.apellido.invalid){
      this.home.toast.fire({icon:'error', title:'Apellido invalido'})
      return
    }
    if(this.employe.controls.cedula.invalid){
      this.home.toast.fire({icon:'error', title:'Cedula invalida'})
      return
    }
    if(this.employe.controls.brithday.invalid){
      this.home.toast.fire({icon:'error', title:'Fecha de nacimiento invalida'})
      return
    }
    if(this.employe.controls.sexo.invalid){
      this.home.toast.fire({icon:'error', title:'Sexo invalido'})
      return
    }
    if(this.employe.controls.ecivil.invalid){
      this.home.toast.fire({icon:'error', title:'Estado civil invalido'})
      return
    }
    if(this.employe.controls.telefono.invalid){
      this.home.toast.fire({icon:'error', title:'Telefono invalido'})
      return
    }
    if(this.employe.controls.email.invalid){
      this.home.toast.fire({icon:'error', title:'Email invalido'})
      return
    }
    this.loading = true
    if(Number(this.employe.controls.id.value)) this.employe.controls.userid.enable()
    var body = JSON.parse(JSON.stringify(this.employe.value))
    body.action = 'add'
    if(Number(this.employe.controls.id.value)){
      body.action = 'update'
      this.employe.controls.userid.disable()
    }
    body.brithday = new Date(body.brithday).toISOString().split('T')[0]
    if(this.settings?.auto_key == null || this.settings?.auto_key == true) body.userid = 0
    body.imagen = this.imagen
    body.tumblr = this.tumblr
    this.http.post('employes/set_info', body, ['object1']).then((res:any)=>{
      this.loading = false
      if(this.title == 'Nuevo'){
        this.home.toast.fire({icon:'success', title:'Guardado con exito'})
        this.employe.controls.userid.setValue(Number(res.userid))
        this.employe.controls.id.setValue(Number(res.id))
        this.employesvc.employe = this.employe.value
        setTimeout(() => { this.router.navigate(['employes/' + this.employe.controls.id.value ]) }, 1000);
      }else{
        this.home.toast.fire({icon:'success', title:'Actualizado con exito'})
      }
    }).catch((err:any)=>{
      this.loading = false
    })
  }

  changeFechaIng(event:any){
    this.employe.controls.allow.setValue(true)
    this.employe.controls.allow.enable()
    var date_split = event.value.toISOString().split('T')[0].split('-')
    var date_string = date_split[2] + '/' + date_split[1] + '/' + date_split[0]
    this.employe.controls.fecha_ing_view.setValue(date_string)
  }

  setBiomtric(){
    this.employe.controls.userid.enable()
    var dialog = this.dialog.open(EmployeBiometricComponent, {data: {devices: this.all_biometrics, employe: this.employe.value}, width: '400px', maxWidth: '90vw', height: 'auto', disableClose:true, panelClass: 'asignUser'})
    this.employe.controls.userid.disable()
    dialog.afterClosed().subscribe((deviceid:any)=>{
      if(deviceid){
        var index = this.all_biometrics.findIndex((x:any)=>x.id == deviceid)
        if(index >= 0) this.all_biometrics[index].userid = Number(this.employe.controls.userid.value)
        this.biometrics = this.all_biometrics.filter((e:any)=>e.userid)
        this.disabled_btn_add_biometric = (this.biometrics.length - this.all_biometrics.length) == 0
        if(this.biometrics.length > 0) this.app_tab = 2
        else this.app_tab = 1
      }
    })
  }

  editBiometric(biometric:any){
    this.loading = true
    this.http.post('device/users/get', {top: 0, search:this.employe.controls.userid.value, deviceid: biometric.id, type:'user' }).then((resp:any)=>{
      if(resp.length > 0){
        const dialogRef = this.dialog.open(UserEditComponent, { data:resp[0], width: '550px', disableClose:true, maxWidth:'86vw', panelClass: 'viewUser' });
        dialogRef.afterClosed().subscribe((data:any)=>{
          if(data){
            if(data === 'DeleteUser'){
                var index = this.all_biometrics.findIndex((x:any)=>x.id == biometric.id)
                if(index >= 0) {
                  this.all_biometrics[index].userid = null
                  this.biometrics = this.all_biometrics.filter((e:any)=>e.userid)
                  if(this.biometrics.length == 0) this.app_tab = 1
                  else this.app_tab = 2
                  this.disabled_btn_add_biometric = (this.biometrics.length - this.all_biometrics.length) == 0
                }
            }else{
              if(!biometric?.id){
                var device = {id: resp[0].id_device, userid: this.employe.controls.userid.value, image: resp[0].imagen_device, name: resp[0].name_device, warning: false}
                this.all_biometrics.push(device)
                this.biometrics = this.all_biometrics.filter((e:any)=>e.userid)
                this.app_tab = 2
                this.disabled_btn_add_biometric = (this.biometrics.length - this.all_biometrics.length) == 0
              }
            }
          }
        })    
      }else{
        this.home.toast.fire({icon:'error', title:'No se encontro el usuario'})
      }
      this.loading = false
    }).catch(()=>{
      this.loading = false
    })
  }

  getBiometrics(){
    this.loading = true
    this.http.get('employes/device/get?userid='+this.employe.controls.userid.value).then((res:any)=>{
      this.loading = false
      this.all_biometrics = res
      this.biometrics = res.filter((e:any)=>e.userid)
      if((this.biometrics.length * 65) >= (this.heigth - 205)) this.scroll_biometrics = true
      this.disabled_btn_add_biometric = (this.biometrics.length - this.all_biometrics.length) == 0
      if(this.all_biometrics.length == 0) this.home.toast.fire({icon:'info', title:'No se encontraron biometricos'})
      if(this.biometrics.length > 0) this.app_tab = 2
    }).catch((err:any)=>{
      this.loading = false
    })
  }
}
