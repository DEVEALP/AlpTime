import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-move-turn',
  templateUrl: './move-turn.component.html',
  styleUrls: ['./move-turn.component.css']
})
export class MoveTurnComponent {

  tab = 1
  users:any[] = []
  turns:any[] = []
  timer:any | undefined
  turn:any | undefined
  user:any | undefined
  loading = false
  loading_users = false
  user_search = ''
  old_user_search = ''
  turn_search = ''
  old_turn_search = ''


  constructor(private home:HomeService, public dialogRef: MatDialogRef<MoveTurnComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http:newHttpRequest) { }

  ngOnInit(): void {
    this.load_turns()
    if(this.data.action == 'change'){
      this.user = this.data.user
      var turn = this.turns.find((turn) => turn.id == this.user?.id_turn)
      if(!this.user || !turn){
        this.home.toast.fire({icon: 'error', title: 'Error al cargar la información del turno'})
        this.dialogRef.close()
      }
      this.turn = turn
    }else if(this.data.action == 'add'){
      this.load_users()
    }else{
      this.home.toast.fire({icon: 'error', title: 'Accion es requerida'})
      this.dialogRef.close()
    }
  }

  writing_users() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.user_search != this.old_user_search) { this.old_user_search = this.user_search ?? ''; this.load_users() }
      clearInterval(this.timer);
    }, 600)
  }

  writing_turns() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.turn_search != this.old_turn_search) { this.old_turn_search = this.turn_search ?? ''; this.load_turns() }
      clearInterval(this.timer);
    }, 600)
  }

  load_turns(){
    clearInterval(this.timer);
    this.turns = this.data.turns.filter((turn:any) => turn.turn_name.toLowerCase().includes(this.turn_search.toLowerCase()))
  }

  formatearCapitalizarTexto(inputString: string) {
    var words = inputString?.trim()?.toLowerCase()?.split(' ')
    var texto = ''
    for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    return texto
  }

  load_users() {
    clearInterval(this.timer);
    this.loading_users = true
    var search = this.user_search
    this.http.post('device/users/get', { type:'min', deviceid:0, search: search, top: 15 }).then((data: any) => {
      this.users = data
      console.log(this.users)
      for(let x of this.users){
        x.userid = Number(x.userid)
        x.id_turn = 0
      }
      this.loading_users = false
    }).catch(() => {
      this.loading_users = false
    })
  }

  closed(): void {
    this.dialogRef.close();
  }

  save(){
    if(this.loading) return
    if(!this.user){
      this.home.toast.fire({icon: 'info', title: 'Seleccione un usuario'})
      return
    }
    if(!this.turn){
      this.home.toast.fire({icon: 'info', title: 'Seleccione un turno'})
      return
    }
    if(this.turn.id == this.data.user?.id_turn){
      this.home.toast.fire({icon: 'info', title: 'El usuario ya se encuentra en este turno'})
      return
    }
    this.loading = true
    var key = new Date().getTime().toString()
    var body = { action: 'change', turnid: this.turn.id, userid: this.user.userid, users: [], days: '', start: this.data.fecha, end: this.data.fecha, key: key}
    this.http.post('turn/asing', body).then((data:any) => {
      if(data && data.length > 0){
        if(data[0].code == 200){
          this.home.toast.fire({icon: 'success', title: 'Turno cambiado correctamente'})
          var result = {imagen: this.user.imagen, name: this.user.name, userid: this.user.userid, turn_name: this.turn.turn_name, id_turn: this.turn.id, date_day: this.data.fecha, entrada: this.turn.he1, estado: data[0].value1, checktime: data[0].value2, day_dif: data[0].value3}
          this.dialogRef.close(result)
        }else{
          this.home.toast.fire({icon: 'error', title: data[0].message})
        }
      }else{
        this.home.toast.fire({icon: 'error', title: 'Error al cambiar el turno del usuario'})
      }
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  }
}
