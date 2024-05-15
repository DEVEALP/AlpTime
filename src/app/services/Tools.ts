export type TimeType = 'seconds' | 'minutes' | 'hours' | 'days'

export abstract class Tools {   

   public static formatearTexto(inputString: string) {
      inputString = inputString.toLowerCase()
      return inputString.charAt(0).toUpperCase() + inputString.slice(1);
   }

   public static formatearCapitalizarTexto(inputString: string) {
      var words = inputString?.trim()?.toLowerCase()?.split(' ')
      var texto = ''
      for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
      return texto
   }

   public static formatearFecha(input: string | Date) {
      let fecha;
      if (typeof input === 'string') fecha = new Date(input);
      else if (input instanceof Date) fecha = input;
      else return 'Formato no válido'
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
      const año = fecha.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${año}`;
      return fechaFormateada;
   }

   public static formatearDecimal(numero: string | number) {
      numero = numero?.toString() ?? '';
      const numeroFloat = parseFloat(numero.replace(',', '.'));
      if (isNaN(numeroFloat)) return "Número inválido";
      const formatoNumero = numeroFloat.toFixed(2).replace(/\./g, ','); 
      const partes = formatoNumero.split(',');
      const parteEntera = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); 
      let resultado = parteEntera;
      if (partes.length === 2) {
         resultado += ',' + partes[1]; 
      } else {
         resultado += ',00'; 
      }
      return resultado;
   }

   public static elapsed_time(type: TimeType, desde: number | string | Date, hasta?: number | string | Date | null, sendNotification?: Function): number | null {
      const startTime = new Date(desde);
      const endTime = new Date(hasta ? hasta : new Date());
      const diff = hasta ? 18000000 : 0
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        if(sendNotification) sendNotification({icon:'error', title:'Fechas invalidas'})
        return null;
      }
      const elapsedMilliseconds = (endTime.getTime() + diff) - (startTime.getTime() + 18000000);
    
      switch (type) {
        case 'seconds':
          return Math.round(elapsedMilliseconds / 1000);
        case 'minutes':
          return Math.round(elapsedMilliseconds / (1000 * 60));
        case 'hours':
          return Math.round(elapsedMilliseconds / (1000 * 60 * 60));
        case 'days':
          return Math.round(elapsedMilliseconds / (1000 * 60 * 60 * 24));
        default:
          // Tipo de tiempo no válido
          return null;
      }
    }
    
}