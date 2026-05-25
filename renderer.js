// Renderer logic: add rows, items, drag & drop, export
document.addEventListener('DOMContentLoaded', () => {
  const tierArea = document.getElementById('tierArea');
  const itemPoolWrapper = document.getElementById('itemPoolWrapper');
  const poolContent = document.getElementById('poolContent');
  const poolToggleBtn = document.getElementById('poolToggleBtn');
  const addRowBtn = document.getElementById('addRowBtn');
  const newRowLabel = document.getElementById('newRowLabel');
  const newRowColor = document.getElementById('newRowColor');
  const imageInput = document.getElementById('imageInput');
  const newTextItem = document.getElementById('newTextItem');
  const exportPNG = document.getElementById('exportPNG');
  const exportJSON = document.getElementById('exportJSON');
  const rowTemplate = document.getElementById('rowTemplate');

  function createRow(label = 'S', color = '#333333'){
    const tpl = rowTemplate.content.cloneNode(true);
    const row = tpl.querySelector('.row');
    const labelInput = tpl.querySelector('.row-label');
    const colorInput = tpl.querySelector('.row-color');
    const dropzone = tpl.querySelector('.row-dropzone');

    labelInput.value = label;
    colorInput.value = color;
    row.style.background = color + '10';

    colorInput.addEventListener('input', ()=>{
      row.style.background = colorInput.value + '10';
    });

    tpl.querySelector('.remove-row').addEventListener('click', ()=>{
      row.remove();
    });

    // drag & drop events
    dropzone.addEventListener('dragover', (e)=>{ e.preventDefault(); dropzone.classList.add('over'); });
    dropzone.addEventListener('dragleave', ()=>{ dropzone.classList.remove('over'); });
    dropzone.addEventListener('drop', (e)=>{
      e.preventDefault(); dropzone.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      const el = document.getElementById(id);
      if(el) dropzone.appendChild(el);
    });

    tierArea.appendChild(tpl);
  }

  function createItemElement({id, imgSrc, text}){
    const item = document.createElement('div');
    item.className = 'card';
    item.id = id || ('card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6));
    item.draggable = true;

    if(imgSrc){
      const img = document.createElement('img'); img.src = imgSrc; item.appendChild(img);
    } else {
      const span = document.createElement('div'); span.className='card-text'; span.textContent = text || 'Item'; item.appendChild(span);
    }

    const del = document.createElement('button'); del.className='remove-card'; del.textContent='✕';
    del.addEventListener('click', ()=> item.remove());
    item.appendChild(del);

    item.addEventListener('dragstart', (e)=>{
      e.dataTransfer.setData('text/plain', item.id);
    });

    return item;
  }

  function addToPool(card){
    poolContent.appendChild(card);
  }

  function togglePool(){
    const isCollapsed = itemPoolWrapper.classList.toggle('collapsed');
    itemPoolWrapper.classList.toggle('open', !isCollapsed);
    poolToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
  }

  poolToggleBtn.addEventListener('click', togglePool);

  poolContent.addEventListener('dragover', (e)=>{
    e.preventDefault();
    poolContent.classList.add('over');
  });

  poolContent.addEventListener('dragleave', ()=>{
    poolContent.classList.remove('over');
  });

  poolContent.addEventListener('drop', (e)=>{
    e.preventDefault();
    poolContent.classList.remove('over');
    const id = e.dataTransfer.getData('text/plain');
    const el = document.getElementById(id);
    if(el) poolContent.appendChild(el);
  });

  addRowBtn.addEventListener('click', ()=>{
    createRow(newRowLabel.value || 'Tier', newRowColor.value);
    newRowLabel.value = '';
  });

  imageInput.addEventListener('change', (e)=>{
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ()=>{
        const card = createItemElement({imgSrc: reader.result});
        addToPool(card);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  newTextItem.addEventListener('keydown', (event)=>{
    if(event.key !== 'Enter') return;
    event.preventDefault();
    const text = newTextItem.value.trim();
    if(!text) return;
    const card = createItemElement({text});
    addToPool(card);
    newTextItem.value = '';
  });

  exportPNG.addEventListener('click', ()=>{
    html2canvas(tierArea, {backgroundColor: '#fff', scale:2}).then(canvas=>{
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'tierlist.png';
      a.click();
    });
  });

  exportJSON.addEventListener('click', ()=>{
    const rows = Array.from(tierArea.querySelectorAll('.row')).map(r=>{
      const label = r.querySelector('.row-label').value;
      const color = r.querySelector('.row-color').value;
      const items = Array.from(r.querySelectorAll('.card')).map(c=>{
        const img = c.querySelector('img');
        return {id: c.id, text: img ? null : (c.querySelector('.card-text')?.textContent||''), img: img ? img.src : null};
      });
      return {label, color, items};
    });
    const blob = new Blob([JSON.stringify({rows},null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tierlist.json';
    a.click();
  });

  // initial demo rows
  createRow('S','#4CAF50');
  createRow('A','#2196F3');
  createRow('B','#FFC107');
  createRow('C','#FF5722');
});
