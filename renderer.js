document.addEventListener('DOMContentLoaded', () => {
  const tierArea = document.getElementById('tierArea');
  const itemPoolWrapper = document.getElementById('itemPoolWrapper');
  const poolContent = document.getElementById('poolContent');
  const poolToggleBtn = document.getElementById('poolToggleBtn');
  const container = document.getElementById('container');
  const addRowBtn = document.getElementById('addRowBtn');
  const addRowMenu = document.getElementById('addRowMenu');
  const menuRowLabel = document.getElementById('menuRowLabel');
  const menuRowColor = document.getElementById('menuRowColor');
  const confirmRowBtn = document.getElementById('confirmRowBtn');
  const imageInput = document.getElementById('imageInput');
  const addContentBtn = document.getElementById('addContentBtn');
  const addContentMenu = document.getElementById('addContentMenu');
  const addImageOptionBtn = document.getElementById('addImageOptionBtn');
  const menuItemText = document.getElementById('menuItemText');
  const confirmItemBtn = document.getElementById('confirmItemBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importInput = document.getElementById('importInput');
  const exportMenu = document.getElementById('exportMenu');
  const rowTemplate = document.getElementById('rowTemplate');

  // Ensure the export menu floats above everything
  document.body.appendChild(exportMenu);
  document.body.appendChild(addRowMenu);
  document.body.appendChild(addContentMenu);

  let dragGhost = null;

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
      const cards = dropzone.querySelectorAll('.card');
      cards.forEach(card => poolContent.appendChild(card));
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
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.id);
      item.classList.add('dragging');

      const ghost = item.cloneNode(true);
      ghost.style.position = 'absolute';
      ghost.style.top = '-9999px';
      ghost.style.left = '-9999px';
      ghost.style.width = `${item.offsetWidth}px`;
      ghost.style.height = `${item.offsetHeight}px`;
      ghost.style.opacity = '1';
      ghost.style.pointerEvents = 'none';
      ghost.style.margin = '0';
      document.body.appendChild(ghost);
      dragGhost = ghost;
      e.dataTransfer.setDragImage(ghost, item.offsetWidth / 2, item.offsetHeight / 2);
    });

    item.addEventListener('dragend', ()=>{
      item.classList.remove('dragging');
      if(dragGhost){
        dragGhost.remove();
        dragGhost = null;
      }
    });

    return item;
  }

  function addToPool(card){
    poolContent.appendChild(card);
  }

  function togglePool(){
    // centralize state on the container so horizontal padding is consistent
    const isCollapsed = container.classList.toggle('pool-collapsed');
    // mirror open class on wrapper for clarity
    itemPoolWrapper.classList.toggle('open', !isCollapsed);
    poolToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
  }

  // Ensure initial collapsed state on load matches the markup
  (function syncInitialPoolState(){
    const initialCollapsed = itemPoolWrapper.classList.contains('collapsed');
    if(initialCollapsed) container.classList.add('pool-collapsed');
    else container.classList.remove('pool-collapsed');
    itemPoolWrapper.classList.toggle('open', !initialCollapsed);
    poolToggleBtn.setAttribute('aria-expanded', String(!initialCollapsed));
  })();

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

  addRowBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const rect = addRowBtn.getBoundingClientRect();
    addRowMenu.style.left = `${Math.min(window.innerWidth - addRowMenu.offsetWidth - 12, Math.max(12, rect.left))}px`;
    addRowMenu.style.top = `${rect.bottom + 8}px`;
    addRowMenu.classList.toggle('open');
    addRowMenu.setAttribute('aria-hidden', String(!addRowMenu.classList.contains('open')));
    if(addRowMenu.classList.contains('open')){
      menuRowLabel.focus();
    }
  });

  confirmRowBtn.addEventListener('click', ()=>{
    const label = menuRowLabel.value.trim() || 'Tier';
    const color = menuRowColor.value;
    createRow(label, color);
    menuRowLabel.value = '';
    menuRowColor.value = '#333333';
    addRowMenu.classList.remove('open');
    addRowMenu.setAttribute('aria-hidden', 'true');
  });

  menuRowLabel.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      confirmRowBtn.click();
    }
  });

  addRowMenu.addEventListener('click', (e)=>{
    e.stopPropagation();
  });

  document.addEventListener('click', ()=>{
    if(addRowMenu.classList.contains('open')){
      addRowMenu.classList.remove('open');
      addRowMenu.setAttribute('aria-hidden', 'true');
    }
    if(addContentMenu.classList.contains('open')){
      addContentMenu.classList.remove('open');
      addContentMenu.setAttribute('aria-hidden', 'true');
    }
    if(exportMenu.classList.contains('open')){
      exportMenu.classList.remove('open');
      exportMenu.setAttribute('aria-hidden', 'true');
    }
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

  addContentBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const rect = addContentBtn.getBoundingClientRect();
    addContentMenu.style.left = `${Math.min(window.innerWidth - addContentMenu.offsetWidth - 12, Math.max(12, rect.left))}px`;
    addContentMenu.style.top = `${rect.bottom + 8}px`;
    addContentMenu.classList.toggle('open');
    addContentMenu.setAttribute('aria-hidden', String(!addContentMenu.classList.contains('open')));
    if(addContentMenu.classList.contains('open')){
      menuItemText.focus();
    }
  });

  addImageOptionBtn.addEventListener('click', ()=>{
    imageInput.click();
  });

  confirmItemBtn.addEventListener('click', ()=>{
    menuItemText.focus();
  });

  menuItemText.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      const text = menuItemText.value.trim();
      if(!text) return;
      const card = createItemElement({text});
      addToPool(card);
      menuItemText.value = '';
      addContentMenu.classList.remove('open');
      addContentMenu.setAttribute('aria-hidden', 'true');
    }
  });

  addContentMenu.addEventListener('click', (e)=>{
    e.stopPropagation();
  });


  // Export helpers
  function exportJSONData(){
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
  }

  function exportImage(format){
    html2canvas(tierArea, {backgroundColor: '#fff', scale:2}).then(canvas=>{
      if(format === 'png'){
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'tierlist.png';
        a.click();
      } else if(format === 'jpg' || format === 'jpeg'){
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.92);
        a.download = 'tierlist.jpg';
        a.click();
      } else if(format === 'pdf'){
        const jsPDF = window.jspdf?.jsPDF || window.jsPDF || window.jspPDF;
        if(!jsPDF){
          alert('PDF export requires jsPDF.');
          return;
        }
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({unit:'px', format:[canvas.width, canvas.height]});
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('tierlist.pdf');
      }
    });
  }

  function importJSONFile(file){
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(reader.result);
        if(!Array.isArray(data.rows)) throw new Error('Invalid format');
        tierArea.querySelectorAll('.row').forEach(row=>row.remove());
        data.rows.forEach(rowData=>{
          const row = createRow(rowData.label || 'Tier', rowData.color || '#333333');
          const createdRow = tierArea.lastElementChild;
          const dropzone = createdRow.querySelector('.row-dropzone');
          (rowData.items||[]).forEach(itemData=>{
            const card = createItemElement({id: itemData.id, imgSrc: itemData.img, text: itemData.text});
            dropzone.appendChild(card);
          });
        });
      } catch(err){
        alert('Failed to import JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Export menu interactions
  exportBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const rect = exportBtn.getBoundingClientRect();
    exportMenu.style.left = `${Math.min(window.innerWidth - exportMenu.offsetWidth - 12, Math.max(12, rect.left))}px`;
    exportMenu.style.top = `${rect.bottom + 8}px`;
    exportMenu.classList.toggle('open');
    exportMenu.setAttribute('aria-hidden', String(!exportMenu.classList.contains('open')));
  });

  importBtn.addEventListener('click', ()=>{
    importInput.click();
  });

  importInput.addEventListener('change', (e)=>{
    const file = e.target.files?.[0];
    if(file) importJSONFile(file);
    e.target.value = '';
  });

  exportMenu.addEventListener('click', (e)=>{
    e.stopPropagation();
    const btn = e.target.closest('.export-option');
    if(!btn) return;
    const format = btn.getAttribute('data-format');
    if(format === 'json') exportJSONData();
    else if(format === 'pdf') exportImage('pdf');
    else if(format === 'png') exportImage('png');
    else if(format === 'jpg') exportImage('jpg');
    exportMenu.classList.remove('open');
    exportMenu.setAttribute('aria-hidden', 'true');
  });

  // initial demo rows
  createRow('S','#4CAF50');
  createRow('A','#2196F3');
  createRow('B','#FFC107');
  createRow('C','#FF5722');
});
