export type pageOrientation = 'vertical' | 'horizontal'
export type alignmentHorizontalInterface = 'left' | 'center' | 'right'
export type typesTotalConfigInterface = 'sum' | 'count' | 'value'
export type FooterType = 'text' | 'image' | 'image_floating'
export type conditionalType = 'equal' | 'different' | 'elderly' | 'minor' | '==' | '!=' | '>' | '<' | 'include'
export type formartInterface = 'string' | 'number' | 'decimal' | 'date' | 'capitalize'
export type alignmentVerticalInterface = 'top' | 'center' | 'bottom'
export type widthInterface = '5%' | '10%' | '15%' | '20%' | '25%' | '30%' | '35%' | '40%' | '45%' | '50%' | '55%' | '60%' | '65%' | '70%' | '75%' | '80%' | '85%' | '90%' | '95%' | '100%' | 'auto'
export interface positionInterface { top: number, left: number, right: number, bottom: number }
export interface boxCoordinatesInterface { top?: number, left?: number, right?: number, bottom?: number }
export interface pointCoordinatesInterface { x?: number, y?: number }
export interface listItemElementSettingsInterface { element: Element, index: number, width: number, maxHeigth: number, margin: number | boxCoordinatesInterface | pointCoordinatesInterface }
export interface wordStyleFontInterface { color?: string, bold?: boolean, fontSize?: number }
export interface wordStylesInterface { word: string, style: wordStyleFontInterface }
interface ConditionalStylesInterface { value:any, condition: conditionalType, style: wordStyleFontInterface }
interface wordStyles2Interface extends wordStylesInterface { index?: number }
export interface ItemConfigInterface { property: string, label?: string, format?: formartInterface, align?: alignmentHorizontalInterface, color?: string, bold?: boolean, subHead?: SubHeadConfigInterface, wordStyles?: wordStylesInterface[], conditionStyle?: ConditionalStylesInterface[] }
export interface HeadConfigInterface { color?: string, background?: string, fontSize?: number, heigth?: number, border?: number | boxCoordinatesInterface | pointCoordinatesInterface, borderColor?: string }
export interface SubHeadConfigInterface { addTitle: string, showItem: boolean }
export interface totalPropertysInterface { type: typesTotalConfigInterface, proeprty: string, value?: number | string }
export interface viewTotalConfigInterface { title?: string, show_total_records?: boolean, propertys?: totalPropertysInterface[], border?: number | boxCoordinatesInterface | pointCoordinatesInterface, borderColor?: string, fontSize?: number, color?: string, background?: string }
export interface FooterInterface { type: FooterType, content: string, fontSize: number, color: string, bold: boolean, alignmentHorizontal: alignmentHorizontalInterface, alignmentVertial: alignmentVerticalInterface, padding: positionInterface, position: pointCoordinatesInterface, width: number | widthInterface, height: any }

export class GeneratorReportPdfV2 {

   private autoPrint: boolean = true
   private settings = "width=900,height=650,titlebar=yes,toolbar=no,menubar=no,location=yes,scrollbars=yes,status=yes";
   private script = this.autoPrint ? '<script> setTimeout(() => { window.print(); if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) { setTimeout(() => { window.close(); }, 8000); }else{ window.close(); } }, 100); </script>' : ''
   private autopage: boolean
   private title: string
   private head = ''
   private style = ''
   private defaultStyle = ''
   private temporal_value = ''
   private temporal_value_obj: any = {}
   private originalHeightPage = 1040
   private originalWidthPage = 720
   private HeightPage = 1049
   private WidthPage = 720
   private stateHeigthPage = 0
   private margin = 0
   private dataId = -1
   private container: HTMLElement | undefined | null
   private page: HTMLElement | undefined
   private orientation: pageOrientation
   private footers: FooterInterface[] = []
   private ListItem: listItemElementSettingsInterface | undefined;
   private possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789"

   constructor(title: string, autopage: boolean, orientation:pageOrientation, marginInitial: number = 0) {
      this.orientation = orientation
      this.autopage = autopage
      this.title = title
      if (orientation.toLowerCase() == 'horizontal') {
         this.originalHeightPage = 720
         this.originalWidthPage = 1040
      }
      this.defaultStyle = '*{-webkit-print-color-adjust: exact; color-adjust: exact;font-family: Arial, Helvetica, sans-serif;-webkit-print-color-adjust: exact; color-adjust: exact;}body{margin: 0px;padding: 0px;}.cont{width: 100%;display: flex;flex-direction: column;position: relative;}.page{overflow: hidden;background: transparent;margin: 0px;margin: 0px;border-radius: 0px;display: flex;flex-direction: column;justify-content: flex-start;align-items: flex-start;position:relative}'
      var style = document.head.querySelector('style');
      if (style) style.innerHTML += '.myContainer{ max-width: 0px; max-height: 0px; overflow: hidden; position: fixed; left: 0px; top: 0px}'
      if (autopage) this.addPage(marginInitial)
   }

   public addPage(margin: number = 0) {
      this.margin = margin
      if (!this.container) {
         this.container = this.CreatorElement('div', 'MyDocument')
         document.body.appendChild(this.container)
      }
      this.WidthPage = this.originalWidthPage - (margin * 2)
      this.HeightPage = this.originalHeightPage - (margin * 2)
      if(this.page){
         this.page.style.height = this.HeightPage + 'px'
         this.page.style.minHeight = this.HeightPage + 'px'
      }
      this.stateHeigthPage = 0
      this.page = this.CreatorElement('div', 'page')
      // this.page.style.background = 'red'
      this.page.style.padding = margin + 'px'
      this.page.style.width = this.WidthPage + 'px'
      this.page.style.minWidth = this.WidthPage + 'px' 
      this.page.style.maxWidth = this.WidthPage + 'px'
      this.page.style.maxHeight = this.HeightPage + 'px'
      this.container.appendChild(this.page)
      for (let footer of this.footers) {
         if (footer.type === 'text') this.addText(footer.content, footer.fontSize, footer.color, footer.bold, footer.alignmentHorizontal, footer.alignmentVertial, footer.padding)
         else if (footer.type === 'image_floating') this.addImageFloating(footer.content, footer.position, footer.width, footer.height)
         // else if(footer.type === 'image') this.addFooterImage(footer.content, footer.position, footer.width, footer.height)
      }
   }

   public async print() {
      var w: any = await this.newWindows('', '_black', this.settings);
      w.document.write(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${this.title}</title>${this.head}<style>${this.defaultStyle}</style><style>${this.style}</style></head><body>${this.container?.outerHTML ?? ''}${this.script}</body></html>`);
      if (this.container) document.body.removeChild(this.container)
      this.container = undefined
   }

   public addFooterImageFloating(image: string, position: pointCoordinatesInterface, width: number | widthInterface, _height?: number | widthInterface) {
      var heigth = _height ? ((typeof _height === 'number') ? _height + 'px' : _height) : 'auto'
      var img: any = this.imageDefault(image, width, heigth)
      img.style.position = 'absolute'
      img.style.left = (position?.x ?? 0) + 'px'
      img.style.top = (position?.y ?? 0) + 'px'
      this.footers.push({ type: 'image_floating', content: image, fontSize: 0, color: '', bold: false, alignmentHorizontal: 'left', alignmentVertial: 'top', padding: { top: 0, left: 0, right: 0, bottom: 0 }, position: position, width: width, height: heigth })
      this.page?.appendChild(img)
   }

   public addImageFloating(image: string, position: pointCoordinatesInterface, width: number | widthInterface, _height?: number | widthInterface) {
      var heigth = _height ? ((typeof _height === 'number') ? _height + 'px' : _height) : 'auto'
      var img: any = this.imageDefault(image, width, heigth)
      img.style.position = 'absolute'
      img.style.left = (position?.x ?? 0) + 'px'
      img.style.top = (position?.y ?? 0) + 'px'
      this.page?.appendChild(img)
   }

   public addImage(image: string, padding: widthInterface | number | boxCoordinatesInterface | pointCoordinatesInterface, width: number | widthInterface, _height?: number | widthInterface) {
      var heigth = _height ? ((typeof _height === 'number') ? _height + 'px' : _height) : 'auto'
      var paddingElement = { top: 0, left: 0, right: 0, bottom: 0 }
      if (typeof padding == 'string') {
         var porcen = (this.WidthPage / 100) * Number(padding.replace('%', ''))
         paddingElement.left = porcen
         paddingElement.right = porcen
         paddingElement.top = porcen
         paddingElement.bottom = porcen
      } else this.getSpacingElement(padding)
      var img: any = this.imageDefault(image, width, heigth)
      img.style.marginTop = paddingElement.top + 'px'
      img.style.marginBottom = paddingElement.bottom + 'px'
      img.style.marginLeft = paddingElement.left + 'px'
      img.style.marginRight = paddingElement.right + 'px'
      this.insertElementToPage(img, paddingElement.top + paddingElement.bottom)
   }

   public addFooterText(content: string, fontSize: number = 10, color: string = '#000000', bold: boolean = false, alignmentHorizontal: alignmentHorizontalInterface = 'left', alignmentVertial: alignmentVerticalInterface = 'top', _padding?: boxCoordinatesInterface | pointCoordinatesInterface | number) {
      var padding = this.getSpacingElement(_padding)
      var text = this.textDefault(content, fontSize, color, bold, alignmentHorizontal, alignmentVertial, padding)
      this.footers.push({ type: 'text', content: content, fontSize: fontSize, color: color, bold: bold, alignmentHorizontal: alignmentHorizontal, alignmentVertial: alignmentVertial, padding: padding, position: { x: 0, y: 0 }, width: 0, height: '' })
      this.insertElementToPage(text, padding.top + padding.bottom)
   }

   public addText(content: string, fontSize: number = 10, color: string = '#000000', bold: boolean = false, alignmentHorizontal: alignmentHorizontalInterface = 'left', alignmentVertial: alignmentVerticalInterface = 'top', _padding?: boxCoordinatesInterface | pointCoordinatesInterface | number) {
      var padding = this.getSpacingElement(_padding)
      var text = this.textDefault(content, fontSize, color, bold, alignmentHorizontal, alignmentVertial, padding)
      this.insertElementToPage(text, padding.top + padding.bottom)
   }

   public addSpace(height: number) {
      var space = this.CreatorElement('div', '')
      space.style.width = 'px'
      space.style.maxWidth = 'px'
      space.style.minWidth = 'px'
      space.style.maxHeight = height + 'px'
      space.style.minHeight = height + 'px'
      space.style.height = height + 'px'
      this.insertElementToPage(space, 0)
   }

   public addTable(data: any[], fontSize: number, color: string, _margin?: number | boxCoordinatesInterface | pointCoordinatesInterface, settingsHead?: HeadConfigInterface, _cellHeight?: number, settingsItems?: ItemConfigInterface[], _border?: number | boxCoordinatesInterface | pointCoordinatesInterface, borderColor?: string, viewTotal?: viewTotalConfigInterface) {
      if (data.length == 0) return;
      this.temporal_value = ''
      var height = 15 + (_cellHeight ?? 0)
      var margin = this.getSpacingElement(_margin)
      var border = this.getSpacingElement(_border)
      var totals = {}
      var configSubHead = settingsItems?.find((s: ItemConfigInterface) => s.subHead != null)

      if ((this.stateHeigthPage + height + margin.top + margin.bottom + border.top + border.bottom + height + (configSubHead ? height : 0)) >= this.HeightPage) this.addPage(this.margin)

      var table = this.createTable(data[0], fontSize, height, color, margin, border, borderColor, settingsHead, settingsItems)

      if (configSubHead){
         var head_property = configSubHead.property ?? ''
         var heads = data.reduce((acc: any, item: any) => { var exists = acc.find((a: any) => a == item[head_property]); if (!exists) acc.push(item[head_property]); return acc }, [])
         if(heads.length > 1) this.tableSubHead(table, data[0], height, fontSize, color, configSubHead)
         else configSubHead = undefined 
      }

      for (let i = 0; i < data.length; i++) {
         var row = this.tableRow(data[i], height, fontSize, color, settingsItems, viewTotal?.propertys)
         table.appendChild(row)
         if ((i + 1) < data.length && (!configSubHead && (this.stateHeigthPage + height) > this.HeightPage) || (configSubHead && (this.stateHeigthPage + height + height) > this.HeightPage)) {
            this.addPage(this.margin)
            table = this.createTable(data[i + 1], fontSize, height, color, margin, border, borderColor, settingsHead, settingsItems)
            if (configSubHead) this.tableSubHead(table, data[i + 1], height, fontSize, color, configSubHead)
         }
         if (configSubHead && (i + 1) < data.length && this.temporal_value != data[i + 1][configSubHead.property]) this.tableSubHead(table, data[i + 1], height, fontSize, color, configSubHead)
      }
      if (viewTotal) {
         if ((this.stateHeigthPage + height) > this.HeightPage) {
            this.addPage(this.margin)
            table = this.createTable(data[0], fontSize, height, color, margin, border, borderColor, settingsHead, settingsItems)
         }
         var tr = this.CreatorElement('tr')
         var text_title = ''
         var border_total = this.getSpacingElement(viewTotal.border)
         if(!viewTotal.show_total_records && viewTotal.title) text_title = viewTotal.title
         else if(viewTotal.show_total_records && !viewTotal.title) text_title = 'Total de registros ' + data.length
         else if(viewTotal.show_total_records && viewTotal.title) text_title = viewTotal.title + '  (' + 'Total de registros ' + data.length + ')'
         tr.style.height = height + 'px'
         tr.style.maxHeight = height + 'px'
         tr.style.minHeight = height + 'px'
         tr.style.overflow = 'hidden'
         tr.style.background = viewTotal.background ?? 'transparent'
         tr.style.color = viewTotal.color ?? color
         tr.style.borderTop = (border_total.top ?? 0) + 'px solid ' + (viewTotal?.borderColor ?? '#000000')
         tr.style.borderLeft = (border_total.left ?? 0) + 'px solid ' + (viewTotal?.borderColor ?? '#000000')
         tr.style.borderRight = (border_total.right ?? 0) + 'px solid ' + (viewTotal?.borderColor ?? '#000000')
         tr.style.borderBottom = (border_total.bottom ?? 0) + 'px solid ' + (viewTotal?.borderColor ?? '#000000')
         this.stateHeigthPage += (height + border_total.top + border_total.bottom)
         var temporal_td: any
         var firsh_element = true
         var old_text = false
         for (let key in data[0]) {
            var setting = settingsItems?.find((s: ItemConfigInterface) => s.property == key)
            if (!setting || setting && !setting?.subHead || setting?.subHead?.showItem) {
               var td: any = this.CreatorElement('td')
               td.style.height = height + 'px'
               td.style.fontSize = (viewTotal.fontSize ?? (fontSize - 1)) + 'px'
               td.style.fontWeight = 'bold'
               td.style.color = viewTotal.color ?? color
               var exists = viewTotal.propertys?.find((p: totalPropertysInterface) => p.proeprty == key)
               if(exists){
                 td.innerHTML = this.temporal_value_obj[key]
                 temporal_td = td
                 old_text = false
                 tr.appendChild(td)
               }else{
                  if(firsh_element){
                     firsh_element = false
                     td.innerHTML = text_title
                     td.colSpan = 1
                     temporal_td = td
                     tr.appendChild(td)
                     old_text = true
                  }else{
                     if(old_text){
                        temporal_td.colSpan = temporal_td.colSpan + 1;
                     }else{
                        old_text = false
                        temporal_td = td
                        tr.appendChild(td)
                     }  
                  }
               }
            }
         }
         table.appendChild(tr)
      }
   }

   // METODOS PRIVADOS
   private createTable(data: any, fontSize: number, height: number, color: string, margin: positionInterface, border: positionInterface, borderColor?: string, settingsHead?: HeadConfigInterface, settingsItems?: ItemConfigInterface[]): HTMLElement {
      var table = this.CreatorElement('table')
      table.style.width = (this.WidthPage - margin.left - margin.right) + 'px'
      table.style.maxWidth = (this.WidthPage - margin.left - margin.right) + 'px'
      table.style.minWidth = (this.WidthPage - margin.left - margin.right) + 'px'
      table.style.borderSpacing = '0px'
      table.style.borderCollapse = 'collapse'
      table.style.marginTop = margin.top + 'px'
      table.style.marginBottom = margin.bottom + 'px'
      table.style.marginLeft = margin.left + 'px'
      table.style.marginRight = margin.right + 'px'
      table.style.borderTop = (border.top ?? 0) + 'px solid ' + (borderColor ?? '#000000')
      table.style.borderLeft = (border.left ?? 0) + 'px solid ' + (borderColor ?? '#000000')
      table.style.borderRight = (border.right ?? 0) + 'px solid ' + (borderColor ?? '#000000')
      table.style.borderBottom = (border.bottom ?? 0) + 'px solid ' + (borderColor ?? '#000000')
      this.insertElementToPage(table, margin.top + margin.bottom)

      var tbody = this.CreatorElement('tbody')
      table.appendChild(tbody)

      var border = this.getSpacingElement(settingsHead?.border)
      var head = this.tableHead(data, settingsHead?.fontSize ?? fontSize, (settingsHead?.heigth ?? 0) + height, settingsHead?.color ?? color, settingsItems)
      head.style.backgroundColor = settingsHead?.background ?? 'transparent'
      head.style.borderTop = (border.top ?? 0) + 'px solid ' + (settingsHead?.borderColor ?? '#000000')
      head.style.borderLeft = (border.left ?? 0) + 'px solid ' + (settingsHead?.borderColor ?? '#000000')
      head.style.borderRight = (border.right ?? 0) + 'px solid ' + (settingsHead?.borderColor ?? '#000000')
      head.style.borderBottom = (border.bottom ?? 0) + 'px solid ' + (settingsHead?.borderColor ?? '#000000')
      tbody.appendChild(head)
      return tbody
   }

   private tableHead(data: any, fontSize: number, height: number, color: string, settingsItems?: ItemConfigInterface[]): HTMLElement {
      var head = this.CreatorElement('tr')
      // head.style.display = 'table'   
      head.style.height = height + 'px'
      head.style.maxHeight = height + 'px'
      head.style.minHeight = height + 'px'
      for (let key in data) {
         var setting = settingsItems?.find((s: ItemConfigInterface) => s.property == key)
         var value = this.formatearTexto(key?.replace('_', ''))
         if (setting?.label) value = setting.label
         this.tableColumn(head, height, fontSize, color, true, value, setting)
      }
      this.stateHeigthPage += height
      return head
   }

   private tableSubHead(table: HTMLElement, data: any, height: number, fontSize: number, color: string, setting: ItemConfigInterface): HTMLElement {
      var head = this.CreatorElement('tr')
      head.style.height = height + 'px'
      head.style.maxHeight = height + 'px'
      head.style.minHeight = height + 'px'
      var td = this.CreatorElement('td')
      td.setAttribute('colspan', Object.keys(data).length.toString());
      this.temporal_value = data[setting.property]?.toString()
      td.innerHTML = this.temporal_value
      if (setting.subHead?.addTitle) td.innerHTML = '<strong>' + setting.subHead.addTitle + '</strong>&nbsp;&nbsp;&nbsp;' + this.temporal_value
      td.style.fontSize = fontSize + 'px'
      td.style.paddingTop = '2px'
      td.style.minHeight = (height - 2) + 'px'
      td.style.maxHeight = (height - 2) + 'px'
      td.style.height = (height - 2) + 'px'
      td.style.color = color
      this.stateHeigthPage += height
      head.appendChild(td)
      table.appendChild(head)
      return head
   }

   private tableRow(data: any, height: number, fontSize: number, color: string, settings?: ItemConfigInterface[], propertys?: totalPropertysInterface[]): HTMLElement {
      var head = this.CreatorElement('tr')
      head.style.height = height + 'px'
      head.style.maxHeight = height + 'px'
      head.style.minHeight = height + 'px'
      head.style.overflow = 'hidden'
      for (let key in data) {
         var property_exist = propertys?.find((p: totalPropertysInterface) => p.proeprty == key)
         if (property_exist) {
            try {
               var value_total:any = 0
               if (!this.temporal_value_obj[key]) this.temporal_value_obj[key] = 0
               if(property_exist.type == 'sum') value_total = Number(data[key] ?? 0)
               else if(property_exist.type == 'count' && data[key]) value_total = 1
               else if(property_exist.type == 'value'){
                  this.temporal_value_obj[key] = ''
                  value_total = property_exist.value ?? ''
               }
               this.temporal_value_obj[key] += value_total
            } catch { }
         }
         var value = data[key] ?? ''
         var setting = settings?.find((s: ItemConfigInterface) => s.property == key)
         if (setting?.format == 'number') value = Number(value).toFixed()
         else if (setting?.format == 'decimal') value = this.formatearDecimal(value)
         else if (setting?.format == 'date') value = this.formatearFecha(value)
         else if (setting?.format == 'string') value = this.formatearTexto(value)
         else if (setting?.format == 'capitalize') value = this.formatearCapitalizarTexto(value)
         this.tableColumn(head, height, fontSize, color, false, value, setting, setting?.wordStyles, setting?.conditionStyle)
      }
      this.stateHeigthPage += height
      return head
   }

   private tableColumn(tr: HTMLElement, height: number, fontSize: number, color: string, bold: boolean, value?: string, setting?: ItemConfigInterface, wordStyles?: wordStyles2Interface[], conditionStyle?: ConditionalStylesInterface[]) {
      if (!setting || setting && !setting?.subHead || setting?.subHead?.showItem) {
         value = value ?? ''
         var innerHTML = value
         if (wordStyles) {
            value = value.toString()
            var initial_index = 0;
            var wordStylesOrden: any[] = []
            for (let wordStyle of wordStyles) {
               var exists = wordStylesOrden.find((w: any) => w.word === wordStyle.word)
               wordStyle.index = value.indexOf(wordStyle.word)
               if (!exists && wordStyle.index >= 0) wordStylesOrden.push(wordStyle)
            }
            wordStylesOrden = wordStylesOrden.sort((a: any, b: any) => a.index - b.index)
            innerHTML = ''
            for (let wordStyle of wordStylesOrden) {
               innerHTML += value.slice(initial_index, wordStyle.index)
               innerHTML += this.setStyleWord(wordStyle.word, wordStyle.style, fontSize)
               initial_index = wordStyle.index + wordStyle.word.length
            }
            if (initial_index < value.length) innerHTML += value.slice(initial_index, value.length)
         }
         if(conditionStyle){
            for (let condition of conditionStyle) {
               if((condition.condition == '==' || condition.condition == 'equal') && condition.value == value){
                  innerHTML = this.setStyleWord(value, condition.style, fontSize)
                  break
               }else if((condition.condition == '!=' || condition.condition == 'different') && condition.value != value){
                  innerHTML = this.setStyleWord(value, condition.style, fontSize)
                  break
               }else if((condition.condition == '>' || condition.condition == 'elderly') && !isNaN(Number(value)) && Number(value) > Number(condition.value)){
                  innerHTML = this.setStyleWord(value, condition.style, fontSize)
                  break
               }else if((condition.condition == '<' || condition.condition == 'minor') && !isNaN(Number(value)) && Number(value) < Number(condition.value)){
                  innerHTML = this.setStyleWord(value, condition.style, fontSize)
                  break
               }else if(condition.condition == 'include' && value.includes(condition.value)){
                  innerHTML = this.setStyleWord(value, condition.style, fontSize)
                  break
               }                  
            }
         }
         var td = this.CreatorElement('td')
         td.style.minHeight = height + 'px'
         td.style.maxHeight = height + 'px'
         td.style.height = height + 'px'
         td.style.fontSize = fontSize + 'px'
         td.style.fontWeight = bold ? 'bold' : 'normal'
         td.style.color = color
         td.innerHTML = innerHTML
         tr.appendChild(td)
      }
   }

   private setStyleWord(word: string, style: wordStyleFontInterface, fontSize: number): string {
      var element = document.createElement('span')
      if(style.color) element.style.color = style.color
      if(style.bold) element.style.fontWeight = 'bold'
      element.style.fontSize = (style.fontSize ? style.fontSize : fontSize) + 'px'
      element.innerHTML = word
      return element.outerHTML
   }

   private textDefault(content: string, fontSize: number, color: string, bold: boolean, alignmentHorizontal: alignmentHorizontalInterface, alignmentVertial: alignmentVerticalInterface, padding: positionInterface): HTMLElement {
      var text = this.CreatorElement('div')
      content = content.split('<tab>').join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
      content = content.split('<tab2>').join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
      text.id = this.dataId.toString()
      text.style.width = (this.WidthPage - padding.left - padding.right) + 'px'
      text.style.minWidth = (this.WidthPage - padding.left - padding.right) + 'px'
      text.style.maxWidth = (this.WidthPage - padding.left - padding.right) + 'px'
      text.style.fontSize = fontSize + 'px'
      text.style.color = color
      text.style.fontWeight = bold ? 'bold' : 'normal'
      text.style.textAlign = alignmentHorizontal
      text.style.display = 'flex'
      text.style.justifyContent = this.getStateAlinmentHorizontal(alignmentHorizontal)
      text.style.alignItems = this.getStateAlinmentVertical(alignmentVertial)
      text.innerHTML = content
      return text;
   }

   private imageDefault(image: string, width: number | widthInterface, height: string): HTMLElement {
      var img: any = this.CreatorElement('img')
      img.src = image
      img.style.minWidth = (typeof width === 'number') ? width + 'px' : width
      img.style.width = (typeof width === 'number') ? width + 'px' : width
      img.style.height = height
      img.style.minHeight = height
      return img
   }

   private insertElementToPage(element: HTMLElement, padding: number) {
      this.page?.appendChild(element)
      var height = (element.clientHeight + padding)
      element.style.height = height + 'px'
      element.style.minHeight = height + 'px'
      element.style.maxHeight = height + 'px'
      element.style.overflow = 'hidden'
      this.stateHeigthPage += height
      if (this.stateHeigthPage > this.HeightPage) {
         this.page?.removeChild(element)
         this.addPage()
         this.page?.appendChild(element)
         this.stateHeigthPage = height
      }
   }

   private CreatorElement(type: keyof HTMLElementTagNameMap, className?: string, margin?: positionInterface, padding?: positionInterface): HTMLElement {
      this.dataId++
      padding = padding ? padding : { top: 0, left: 0, right: 0, bottom: 0 }
      margin = margin ? margin : { top: 0, left: 0, right: 0, bottom: 0 }
      var element = document.createElement(type)
      element.className = className ?? '';
      element.id = this.dataId.toString()
      element.style.marginTop = margin.top + 'px'
      element.style.marginBottom = margin.bottom + 'px'
      element.style.marginLeft = margin.left + 'px'
      element.style.marginRight = margin.right + 'px'
      element.style.paddingTop = padding.top + 'px'
      element.style.paddingBottom = padding.bottom + 'px'
      element.style.paddingLeft = padding.left + 'px'
      element.style.paddingRight = padding.right + 'px'
      return element
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

   private getStateAlinmentHorizontal(state: alignmentHorizontalInterface): string {
      if (state == 'left') return 'flex-start'
      else if (state == 'right') return 'flex-end'
      else return state
   }

   private getStateAlinmentVertical(state: alignmentVerticalInterface): string {
      if (state == 'top') return 'flex-start'
      else if (state == 'bottom') return 'flex-end'
      else return state
   }

   private async newWindows(url: string, title: string, settings: string): Promise<Window | null | undefined> {
      var w: Window | null = window.open(url, title, settings);
      if (w == null || typeof (w) == 'undefined') {
         console.error('Notificaiones bloqueadas')
         return
      } else {
         return w
      }
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