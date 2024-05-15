type formartInterface = 'string' | 'number' | 'decimal' | 'date' | 'capitalize'
type typesTotalConfigInterface = 'sum' | 'count' | 'value'
type alignmentHorizontalInterface = 'left' | 'center' | 'right'
interface pagesInterface { page: ExcelJS.Worksheet, key: string, cell: number }
interface wordStylesInterface { word: string, style: Partial<ExcelJS.Font> }
interface wordStylesOrdenInterface { word: string, index: number, style: Partial<ExcelJS.Font> | undefined }
interface objetInterface { [key: string]: any; }
interface borderInterface { color: string, position: number | boxCoordinatesInterface | pointCoordinatesInterface }
interface positionInterface { top: number, left: number, right: number, bottom: number }
interface boxCoordinatesInterface { top?: number, left?: number, right?: number, bottom?: number }
interface pointCoordinatesInterface { x?: number, y?: number }
interface SubHeadConfigInterface { addTitle: string, showItem: boolean }
interface ItemConfigInterface { property: string, label?: string, format?: formartInterface, align?: alignmentHorizontalInterface, style?: Partial<ExcelJS.Font>, isHead?: SubHeadConfigInterface }
interface headTableInterface { font: Partial<ExcelJS.Font>, background: string, border: borderInterface }
interface totalPropertysInterface { type: typesTotalConfigInterface, property: string, value?: number | string }
export interface totalTableInterface { title?: string, total_items?: boolean, propertys?: totalPropertysInterface[], font?: Partial<ExcelJS.Font>, background?: string, border?: borderInterface }

import * as ExcelJS from 'exceljs';

export class GeneratorReportExcel {
   private columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
   private workbook: ExcelJS.Workbook;
   private actual_page: ExcelJS.Worksheet | undefined;
   private actual_row: number = 0;
   private pages: pagesInterface[] = []

   constructor() {
      this.workbook = new ExcelJS.Workbook();
   }

   public addPage(pageName: string, key?: string) {
      if (key === undefined) key = Object.keys(this.pages).length.toString();
      this.actual_page = this.workbook.addWorksheet(pageName);
      this.pages.push({ page: this.actual_page, key: key, cell: 0 })
      this.actual_row = 0;
   }

   public addTable(data: objetInterface[], Cellrow?: string, style?: ExcelJS.Font, border?: borderInterface, property?: ItemConfigInterface[], head?: headTableInterface, total?: totalTableInterface, key?: string) {
      var page = this.getPage(key);
      var column = ''
      var row = 0;
      if (!page || data.length == 0) return;
      if (Cellrow && Cellrow.length == 2) {
         column = Cellrow.split('')[0];
         row = parseInt(Cellrow.split('')[1]);
         this.actual_row = row
      } else {
         this.actual_row++
         row = this.actual_row;
         column = 'A'
      }
      var temporal_values:objetInterface = {}
      var temporal_column = column
      var index_key = 0;
      var border_spacing = this.getSpacingElement(border?.position)
      for (let key in data[0]) {
         index_key++
         var setting = property?.find(p => p.property === key)
         var value_key = this.formatearTexto(key ?? '')
         if (setting && setting.label) value_key = setting.label
         page.getCell(temporal_column + row).value = value_key
         if (head) {
            if (head.border) {
               var border_spacing_cell = this.getSpacingElement(head.border.position)
               var border_cell: Partial<ExcelJS.Borders> = {}
               if ((border_spacing_cell.left > 0 || border_spacing.left) && temporal_column == column) border_cell.left = { style: 'thin', color: { argb: (head.border.color ?? border?.color) } }
               if ((border_spacing_cell.right > 0 || border_spacing.right) && index_key == Object.keys(data[0]).length) border_cell.right = { style: 'thin', color: { argb: (head.border.color ?? border?.color) } }
               if (border_spacing_cell.top > 0 || border_spacing.top) border_cell.top = { style: 'thin', color: { argb: head.border.color } }
               if (border_spacing_cell.bottom > 0) border_cell.bottom = { style: 'thin', color: { argb: head.border.color } }
               page.getCell(temporal_column + row).border = border_cell
            }
         } else {
            page.getCell(temporal_column + row).font = { bold: true }
         }
         temporal_column = this.columns[this.columns.indexOf(temporal_column) + 1]
      }
      row++;
      var index_column = 0
      for (let item of data) {
         temporal_column = column
         index_key = 0;
         index_column++;
         for (let key in item) {
            index_key++
            var value = item[key]
            if(total){
               var setting_property = total.propertys?.find(p => p.property === key)
               if(setting_property){
                  if(setting_property.type === 'sum'){
                     if(!temporal_values[key]) temporal_values[key] = 0
                     temporal_values[key] += value
                  }else if(setting_property.type === 'count'){
                     if(!temporal_values[key]) temporal_values[key] = 0
                     if(value) temporal_values[key]++
                  }else if(setting_property.type === 'value'){
                     temporal_values[key] = setting_property.value
                  }
               }
            }
            page.getCell(temporal_column + row).value = value
            var border_cell: Partial<ExcelJS.Borders> = {}
            if (border_spacing.left && temporal_column == column) border_cell.left = { style: 'thin', color: { argb: border?.color } }
            if (border_spacing.right && index_key == Object.keys(item).length) border_cell.right = { style: 'thin', color: { argb: border?.color } }
            if (border_spacing.bottom && index_column == data.length && !total) border_cell.bottom = { style: 'thin', color: { argb: border?.color } }
            page.getCell(temporal_column + row).border = border_cell
            temporal_column = this.columns[this.columns.indexOf(temporal_column) + 1]
         }
         row++;
      }
      if (total) {
         index_key = 0
         var title_insert = false
         var cell_title = ''
         var old_column = ''
         temporal_column = column
         for (let key in data[0]) {
            index_key++
            var setting_property = total.propertys?.find(p => p.property === key)
            if (setting_property) {
               if(cell_title != '' && old_column != ''){
                  page.mergeCells(cell_title + ':' + old_column + row) 
                  old_column = ''
                  cell_title = ''
               }
               var value = temporal_values[key]
               if(setting_property.type === 'sum') value = this.formatearDecimal(value)
               page.getCell(temporal_column + row).value = value
            }else{
               if(!title_insert){
                  page.getCell(temporal_column + row).value = total.title ?? ''
                  title_insert = true
                  cell_title = temporal_column + row
               }else{
                  old_column = temporal_column
               }
            }
            var border_cell: Partial<ExcelJS.Borders> = {}
            if (border_spacing.left && temporal_column == column) border_cell.left = { style: 'thin', color: { argb: border?.color } }
            if (border_spacing.right && index_key == Object.keys(data[0]).length) border_cell.right = { style: 'thin', color: { argb: border?.color } }
            if (border_spacing.bottom) border_cell.bottom = { style: 'thin', color: { argb: border?.color } }
            page.getCell(temporal_column + row).border = border_cell
            temporal_column = this.columns[this.columns.indexOf(temporal_column) + 1]
         }
      }
   }

   public addColumnWidth(column: string | string[], width: number, key?: string) {
      var page = this.getPage(key);
      if (!page) return;
      if (Array.isArray(column)) {
         for (let col of column) page.getColumn(col).width = width;
      } else {
         page.getColumn(column).width = width;
      }
   }

   public addText(text: string, row?: string, style?: Partial<ExcelJS.Font>, wordStyles?: wordStylesInterface[], key?: string): void {
      var page = this.getPage(key);
      if (!page) return;
      if (!row || row.length != 2) {
         this.actual_row++
         row = 'A' + this.actual_row.toString();
      } else {
         this.actual_row = parseInt(row.split('')[1]);
      }
      var texts: ExcelJS.RichText[] = []
      if (wordStyles) {
         var initial_index = 0;
         var wordStylesOrden: wordStylesOrdenInterface[] = []
         for (let wordStyle of wordStyles) {
            var exists = wordStylesOrden.find((w: any) => w.word === wordStyle.word)
            var index = text.indexOf(wordStyle.word)
            if (!exists && index >= 0) wordStylesOrden.push({ word: wordStyle.word, index: index, style: wordStyle.style })
         }
         wordStylesOrden = wordStylesOrden.sort((a: any, b: any) => a.index - b.index)
         for (let wordStyle of wordStylesOrden) {
            texts.push({ 'text': text.slice(initial_index, wordStyle.index) })
            texts.push({ 'text': wordStyle.word, 'font': wordStyle.style })
            initial_index = wordStyle.index + wordStyle.word.length
         }
         if (initial_index < text.length) texts.push({ 'text': text.slice(initial_index, text.length) })
      } else {
         texts.push({ 'font': style, 'text': text })
      }
      page.getCell(row).value = { 'richText': texts }

   }

   public combinateColumns(columns: string | string[], key?: string) {
      var page = this.getPage(key);
      if (!page) return;
      if (Array.isArray(columns)) {
         columns.forEach(col => page?.mergeCells(col));
      } else {
         page.columns = [{ header: columns, key: columns, width: 15 }];
      }
   }

   public download(name_file: string) {
      this.workbook.xlsx.writeBuffer().then((data) => {
         const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = name_file + '.xlsx';
         a.click();
         window.URL.revokeObjectURL(url);
      });
   }

   private getPage(key?: string): ExcelJS.Worksheet | undefined {
      if (key === undefined) return this.actual_page;
      else {
         var page = this.pages.find(p => p.key === key);
         if (page) {
            this.actual_page = page.page;
            this.actual_row = page.cell;
            return page.page;
         }
         else return undefined;
      };
   }

   private getSpacingElement(space?: number | boxCoordinatesInterface | pointCoordinatesInterface): positionInterface {
      let position: positionInterface = { top: 0, left: 0, right: 0, bottom: 0 };
      if (typeof space === 'number') {
         position.top = space;
         position.left = space;
         position.right = space;
         position.bottom = space;
      } else if (space) {
         if ('x' in space || 'y' in space) {
            if (space?.y) {
               position.top = space.y;
               position.bottom = space.y;
            }
            if (space?.x) {
               position.left = space.x;
               position.right = space.x;
            }
         } else if ('top' in space || 'left' in space || 'right' in space || 'bottom' in space) {
            position.top = space?.top ?? 0;
            position.left = space?.left ?? 0;
            position.right = space?.right ?? 0;
            position.bottom = space?.bottom ?? 0;
         }
      }
      return position;
   }

   private formatearTexto(inputString: string) {
      inputString = inputString.toLowerCase()
      return inputString.charAt(0).toUpperCase() + inputString.slice(1);
   }

   private formatearCapitalizarTexto(inputString: string) {
      var words = inputString?.trim()?.toLowerCase()?.split(' ')
      var texto = ''
      for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
      return texto
   }

   private formatearFecha(input: string | Date) {
      let fecha;
      if (typeof input === 'string') fecha = new Date(input);
      else if (input instanceof Date) fecha = input;
      else return 'Formato no válido'
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses en JavaScript van de 0 a 11
      const año = fecha.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${año}`;
      return fechaFormateada;
   }

   private formatearDecimal(numero: string | number) {
      numero = numero?.toString() ?? '';
      const numeroFloat = parseFloat(numero.replace(',', '.'));
      if (isNaN(numeroFloat)) return "Número inválido";
      const formatoNumero = numeroFloat.toFixed(2).replace(/\./g, ','); // Formato con coma para decimales
      const partes = formatoNumero.split(','); // Separar parte entera de los decimales
      const parteEntera = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Separador de miles con punto
      let resultado = parteEntera;
      if (partes.length === 2) {
         resultado += ',' + partes[1]; // Agregar decimales
      } else {
         resultado += ',00'; // Añadir decimales en caso de que no haya
      }
      return resultado;
   }
} 