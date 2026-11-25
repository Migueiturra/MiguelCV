(()=>{
  'use strict';

  const storageKey='cvClaroDraft:v1';
  const data={name:'',email:'',phone:'',location:'',website:'',profile:'',skills:'',languages:'',extras:'',experience:[],education:[]};
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid=()=>window.crypto?.randomUUID?.()||`entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function setStatus(message,error=false){
    const el=$('#importStatus');
    el.textContent=message;
    el.classList.toggle('error',error);
  }
  function setFormStatus(message,error=false){
    const el=$('#formStatus');
    el.textContent=message;
    el.classList.toggle('error',error);
  }
  function showForm(){
    $('#formPanel').classList.remove('hidden');
    $('#startCard').classList.add('hidden');
  }
  function emptyEntry(kind){
    return {id:uid(),title:'',org:'',place:'',date:'',...(kind==='experience'?{desc:''}:{})};
  }
  function add(kind,entry={}){
    const list=kind==='experience'?data.experience:data.education;
    list.push({...emptyEntry(kind),...entry,id:entry.id||uid()});
    renderInputs(kind);
    render();
    saveDraft();
  }
  function renderInputs(kind){
    const list=kind==='experience'?data.experience:data.education;
    const el=kind==='experience'?$('#experienceList'):$('#educationList');
    el.innerHTML=list.map((it,i)=>`<div class="repeat-card" data-id="${esc(it.id)}"><button class="remove-entry" type="button" aria-label="Quitar ${kind==='experience'?'experiencia':'formación'} ${i+1}">×</button><p class="entry-head">${kind==='experience'?'Experiencia':'Formación'} ${i+1}</p><div class="field-grid"><label class="field"><span>${kind==='experience'?'Cargo':'Título o grado'}</span><input data-kind="${kind}" data-id="${esc(it.id)}" data-key="title" placeholder="${kind==='experience'?'Analista de personas':'Psicología'}" value="${esc(it.title)}"></label><label class="field"><span>${kind==='experience'?'Empresa':'Institución'}</span><input data-kind="${kind}" data-id="${esc(it.id)}" data-key="org" placeholder="Nombre de la organización" value="${esc(it.org)}"></label><label class="field"><span>Ubicación <small>Opcional</small></span><input data-kind="${kind}" data-id="${esc(it.id)}" data-key="place" placeholder="Ciudad" value="${esc(it.place)}"></label><label class="field"><span>Fechas</span><input data-kind="${kind}" data-id="${esc(it.id)}" data-key="date" placeholder="2022 – Actualidad" value="${esc(it.date)}"></label>${kind==='experience'?`<label class="field full"><span>Responsabilidades o logros <small>Un punto por línea</small></span><textarea rows="3" data-kind="${kind}" data-id="${esc(it.id)}" data-key="desc" placeholder="Describe tus principales aportes, responsabilidades o resultados.">${esc(it.desc)}</textarea></label>`:''}</div></div>`).join('');
    el.querySelectorAll('.remove-entry').forEach(button=>button.addEventListener('click',()=>{
      const id=button.closest('.repeat-card').dataset.id;
      const target=kind==='experience'?data.experience:data.education;
      target.splice(target.findIndex(item=>item.id===id),1);
      renderInputs(kind);render();saveDraft();
    }));
    el.querySelectorAll('[data-kind]').forEach(field=>field.addEventListener('input',()=>{
      const target=kind==='experience'?data.experience:data.education;
      const item=target.find(entry=>entry.id===field.dataset.id);
      if(item)item[field.dataset.key]=field.value;
      render();saveDraft();
    }));
  }
  function block(item){
    const title=item.title||'',org=item.org||'',date=item.date||'',place=item.place||'';
    if(!title&&!org)return '';
    return `<div class="resume-item"><div class="resume-item-top"><strong>${esc(title||org)}</strong><span class="date">${esc(date)}</span></div>${title&&org?`<div class="sub">${esc(org)}${place?' · '+esc(place):''}</div>`:''}${item.desc?`<div class="desc">${esc(item.desc)}</div>`:''}</div>`;
  }
  function render(){
    $('#pName').textContent=data.name||'Tu nombre';
    const contact=[data.email,data.phone,data.location,data.website].filter(Boolean);
    $('#pContact').innerHTML=contact.length?contact.map(esc).join(' <span>·</span> '):'correo@ejemplo.cl <span>·</span> Ciudad, País';
    $('#pProfile').textContent=data.profile||'Tu perfil profesional aparecerá aquí.';
    $('#pProfile').classList.toggle('muted-preview',!data.profile);
    $('#pProfileSection').style.display=data.profile?'':'none';
    const experience=data.experience.map(block).filter(Boolean).join('');
    $('#pExperience').innerHTML=experience||'<p class="muted-preview">Agrega tu experiencia laboral.</p>';
    const education=data.education.map(block).filter(Boolean).join('');
    $('#pEducation').innerHTML=education||'<p class="muted-preview">Agrega tu formación académica.</p>';
    $('#pSkills').textContent=data.skills||'Tus habilidades aparecerán aquí.';
    $('#pSkills').classList.toggle('muted-preview',!data.skills);
    $('#pSkillsSection').style.display=data.skills?'':'none';
    const other=[data.languages&&`Idiomas: ${data.languages}`,data.extras].filter(Boolean).join(' · ');
    $('#pLanguages').textContent=other||'Agrega idiomas o antecedentes complementarios.';
    $('#pLanguages').classList.toggle('muted-preview',!other);
    $('#pLanguagesSection').style.display=other?'':'none';
  }
  let saveTimer;
  function saveDraft(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      try{
        localStorage.setItem(storageKey,JSON.stringify(data));
        $('#draftStatus').textContent='Borrador guardado en este navegador.';
      }catch{
        $('#draftStatus').textContent='No se pudo guardar aquí. Descarga el PDF antes de cerrar esta página.';
      }
    },250);
  }
  function hasDraft(value){
    return ['name','email','phone','location','website','profile','skills','languages','extras'].some(key=>value[key])||value.experience?.length||value.education?.length;
  }
  function loadDraft(){
    try{
      const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(!saved||typeof saved!=='object')return false;
      for(const key of Object.keys(data)){
        if(key==='experience'||key==='education'){
          data[key]=Array.isArray(saved[key])?saved[key].map(item=>({...emptyEntry(key==='experience'?'experience':'education'),...item,id:item.id||uid()})):[];
        }else if(typeof saved[key]==='string')data[key]=saved[key];
      }
      $$('[data-field]').forEach(field=>field.value=data[field.dataset.field]||'');
      renderInputs('experience');renderInputs('education');render();
      if(hasDraft(data)){showForm();$('#draftStatus').textContent='Recuperamos tu borrador guardado en este navegador.';return true;}
    }catch{
      $('#draftStatus').textContent='No se pudo recuperar el borrador guardado.';
    }
    return false;
  }

  function normalizeText(text){
    return String(text||'').replace(/\r/g,'').replace(/[\t\u00a0]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  }
  function pdfItemsToText(items){
    const lines=[];let line=[];let previousY=null;let previousItem=null;
    const flush=()=>{if(line.length)lines.push(line.join(' ').replace(/\s+/g,' ').trim());line=[];};
    for(const item of items){
      const value=String(item.str||'').trim();
      if(!value)continue;
      const y=Number(item.transform?.[5]);
      const size=Math.max(Number(item.height)||0,Number(previousItem?.height)||0,1);
      const changedLine=previousY!==null&&Number.isFinite(y)&&Math.abs(y-previousY)>Math.max(2,size*.35);
      if(changedLine||previousItem?.hasEOL)flush();
      line.push(value);
      if(item.hasEOL)flush();
      previousY=Number.isFinite(y)?y:previousY;
      previousItem=item;
    }
    flush();
    return lines.join('\n');
  }
  const aliases={
    profile:['perfil','perfil profesional','resumen','resumen profesional','sobre mi','objetivo profesional','professional summary','summary'],
    experience:['experiencia','experiencia laboral','experiencia profesional','trayectoria profesional','employment','work experience','experience'],
    education:['formacion','formacion academica','educacion','estudios','education','academic background'],
    skills:['habilidades','competencias','skills','technical skills'],
    languages:['idiomas','languages'],
    extras:['certificaciones','cursos','otros antecedentes','informacion adicional','certifications','additional information','proyectos','voluntariado']
  };
  function plain(text){return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^[\s\d.•*-]+/,'').trim();}
  function matchHeading(line){
    const normalized=plain(line).replace(/[:：]+$/,'').trim();
    for(const [section,names] of Object.entries(aliases)){
      for(const name of names){
        const base=plain(name);
        if(normalized===base)return {section,rest:''};
        if(normalized.startsWith(base+':')||normalized.startsWith(base+' - ')||normalized.startsWith(base+' — ')){
          return {section,rest:line.slice(name.length).replace(/^\s*[:：\-—–]\s*/, '').trim()};
        }
      }
    }
    return null;
  }
  function getSections(text){
    const out={profile:[],experience:[],education:[],skills:[],languages:[],extras:[],other:[]};
    let current='other';
    for(const line of normalizeText(text).split('\n').map(value=>value.trim()).filter(Boolean)){
      const heading=matchHeading(line);
      if(heading){current=heading.section;if(heading.rest)out[current].push(heading.rest);continue;}
      out[current].push(line);
    }
    return out;
  }
  function dateIn(line){
    return line.match(/(?:\b(?:0?[1-9]|1[0-2])[./-](?:19|20)\d{2}\b\s*(?:[-–—]|a|hasta)\s*(?:(?:0?[1-9]|1[0-2])[./-])?(?:(?:19|20)\d{2}|actualidad|presente|presente|current|present)?|\b(?:19|20)\d{2}\s*(?:[-–—]|a|hasta)\s*(?:(?:19|20)\d{2}|actualidad|presente|current|present)\b|\b(?:19|20)\d{2}\b)/i);
  }
  function splitEntries(lines){
    const entries=[];let current=null;
    const start=()=>{current={title:'',org:'',place:'',date:'',desc:''};};
    const push=()=>{if(current&&(current.title||current.org||current.date||current.desc))entries.push(current);current=null;};
    for(const original of lines){
      const line=original.replace(/^\s*[•▪●*-]\s*/,'').trim();
      if(!line)continue;
      const match=dateIn(line);
      if(match){
        const before=line.slice(0,match.index).replace(/[|,·–—-]+$/,'').trim();
        const after=line.slice(match.index+match[0].length).trim();
        if(current&&(current.date||current.desc))push();
        if(!current)start();
        current.date=match[0].trim();
        const inline=[before,after].filter(Boolean).join(' ');
        if(inline&&!current.title)current.title=inline;
        else if(inline)current.desc+=(current.desc?'\n':'')+'• '+inline;
        continue;
      }
      if(!current)start();
      if(!current.title)current.title=line;
      else if(!current.org)current.org=line;
      else current.desc+=(current.desc?'\n':'')+'• '+line;
    }
    push();
    return entries.filter(item=>item.title||item.org||item.date);
  }
  function findName(lines){
    const skip=/^(curr[ií]culum( vitae)?|resume|cv|perfil|experiencia|educaci[oó]n|formaci[oó]n|datos personales|contacto)$/i;
    return lines.slice(0,8).find(line=>{
      const value=line.trim();
      return value.length>3&&value.length<65&&!/@|\d/.test(value)&&!skip.test(value)&&value.split(/\s+/).length>=2&&/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$/.test(value);
    })||'';
  }
  async function extract(file){
    if(file.size>8*1024*1024)throw Error('El archivo supera el máximo de 8 MB.');
    const name=file.name.toLowerCase();
    if(name.endsWith('.docx')){
      if(!window.mammoth)throw Error('No se pudo cargar el lector de Word. Revisa tu conexión e inténtalo de nuevo.');
      const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
      return result.value;
    }
    if(name.endsWith('.pdf')){
      if(!window.pdfjsLib)throw Error('No se pudo cargar el lector de PDF. Revisa tu conexión e inténtalo de nuevo.');
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
      if(pdf.numPages>100)throw Error('El PDF tiene más de 100 páginas. Prueba con una versión más breve.');
      const pages=[];
      for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
        const page=await pdf.getPage(pageNumber);
        const content=await page.getTextContent();
        pages.push(pdfItemsToText(content.items));
      }
      return pages.join('\n');
    }
    throw Error('Formato no compatible. Sube un archivo PDF o DOCX.');
  }

  $$('[data-field]').forEach(field=>field.addEventListener('input',()=>{
    data[field.dataset.field]=field.value;render();saveDraft();
  }));
  $('#startBlank').addEventListener('click',()=>{
    showForm();
    if(!data.experience.length)add('experience');
    if(!data.education.length)add('education');
    setFormStatus('');
    saveDraft();
  });
  $$('[data-add]').forEach(button=>button.addEventListener('click',()=>add(button.dataset.add)));
  $('#resetButton').addEventListener('click',()=>{
    if(!window.confirm('¿Borrar el borrador guardado en este navegador y empezar de nuevo?'))return;
    try{localStorage.removeItem(storageKey);}catch{}
    location.reload();
  });
  $('#downloadButton').addEventListener('click',()=>window.print());
  $('#fileInput').addEventListener('change',async event=>{
    const input=event.currentTarget,file=input.files?.[0];
    if(!file)return;
    setStatus('Leyendo el documento…');
    setFormStatus('');
    try{
      const text=normalizeText(await extract(file));
      if(!text)throw Error('No encontramos texto seleccionable. Los PDF escaneados o las imágenes requieren OCR y no se pueden importar todavía.');
      $('#sourceText').value=text;
      $('#sourceDetails').open=true;
      const lines=text.split('\n').map(value=>value.trim()).filter(Boolean);
      const sections=getSections(text);
      data.name=findName(lines);
      const email=text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
      const phone=text.match(/(?:\+?\d[\d ()-]{7,}\d)/);
      const website=text.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|github\.com\/)[\w./-]+/i);
      data.email=email?.[0]||'';
      data.phone=phone?.[0]?.trim()||'';
      data.website=website?.[0]||'';
      data.profile=sections.profile.join(' ');
      data.skills=sections.skills.join(', ');
      data.languages=sections.languages.join(', ');
      data.extras=sections.extras.join(' · ');
      data.experience=splitEntries(sections.experience).map(item=>({...item,id:uid()}));
      data.education=splitEntries(sections.education).map(item=>({...item,id:uid()}));
      $$('[data-field]').forEach(field=>field.value=data[field.dataset.field]||'');
      if(!data.experience.length)data.experience.push(emptyEntry('experience'));
      if(!data.education.length)data.education.push(emptyEntry('education'));
      renderInputs('experience');renderInputs('education');showForm();render();saveDraft();
      const warnings=[];
      if(!data.name)warnings.push('nombre');
      if(!data.experience.some(item=>item.title||item.org))warnings.push('experiencia');
      if(!data.education.some(item=>item.title||item.org))warnings.push('formación');
      const message=warnings.length
        ?`Texto extraído. Revisa especialmente ${warnings.join(', ')}: no pudimos identificarlos con seguridad.`
        :'Texto extraído. Revisa los datos y corrige lo que haya quedado mal clasificado.';
      setFormStatus(message,warnings.length>0);
      setStatus('');
    }catch(error){
      const message=error.message||'No pudimos leer este archivo.';
      setStatus(message,true);
      setFormStatus(message,true);
    }finally{
      input.value='';
    }
  });

  loadDraft();
  render();
})();
