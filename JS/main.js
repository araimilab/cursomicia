// === MINI CAMPUS: VERSIÓN ROBUSTA ===
(function() {
  'use strict';

  // Configuración
  const TOTAL_DAYS = 30;
  let currentDay = 1;
  let courseProgress = JSON.parse(localStorage.getItem('courseProgress')) || {};

  // === CONTENIDO MÍNIMO DE PRUEBA (reemplaza con tu contenido completo) ===
  const LESSON_TITLES = Array.from({length: 30}, (_, i) => `Lección ${i+1}`);
  
  const LESSON_TEXTS = {};
  for (let i = 1; i <= 30; i++) {
    LESSON_TEXTS[i] = `<p>Contenido de la lección ${i}. Según el autor, este es un ejemplo de texto teórico.</p>`;
  }

  const CUANT_PROMPTS = Array(30).fill("Prompt cuantitativo de ejemplo.");
  const CUAL_PROMPTS = Array(30).fill("Prompt cualitativo de ejemplo.");

  // === FUNCIONES DE BLOQUEO ===
  function isModule1Complete() { 
    return countCompleted(1, 7) >= 5; 
  }
  function isModule2Complete() { 
    return countCompleted(8, 14) >= 5; 
  }
  function isModule3Complete() { 
    return countCompleted(15, 22) >= 6; 
  }
  function countCompleted(start, end) {
    let count = 0;
    for (let i = start; i <= end; i++) {
      if (courseProgress[i]) count++;
    }
    return count;
  }
  function isDayUnlocked(day) {
    if (day <= 7) return true;
    if (day <= 14) return isModule1Complete();
    if (day <= 22) return isModule2Complete();
    return isModule3Complete();
  }

  // === RENDERIZADO ===
  function renderSidebar() {
    try {
      const sidebar = document.getElementById('sidebar');
      if (!sidebar) {
        console.error("❌ Elemento #sidebar no encontrado");
        return;
      }

      const modules = [
        { id: 1, title: "Módulo 1: Planteamiento", days: 7 },
        { id: 2, title: "Módulo 2: Marco teórico", days: 7, locked: !isModule1Complete() },
        { id: 3, title: "Módulo 3: Metodología", days: 8, locked: !isModule2Complete() },
        { id: 4, title: "Módulo 4: Redacción y cierre", days: 8, locked: !isModule3Complete() }
      ];

      let html = '';
      let dayCounter = 1;

      modules.forEach(module => {
        const lockIcon = module.locked ? '🔒' : '▼';
        const headerClass = module.locked ? 'module-header locked' : 'module-header';
        
        html += `
          <div class="module">
            <div class="${headerClass}" onclick="window.toggleModuleIfUnlocked(${module.id})">
              <span>${module.title}</span><span>${lockIcon}</span>
            </div>
            <div class="module-content" id="module${module.id}" style="${module.id === 1 ? 'display:block;' : 'display:none;'}">
              ${Array.from({length: module.days}, (_, i) => {
                const day = dayCounter + i;
                const locked = !isDayUnlocked(day);
                const itemClass = `lesson-item${locked ? ' locked' : ''}`;
                return `<div class="${itemClass}" data-day="${day}" onclick="window.showLessonIfUnlocked(${day})">Día ${day}: ${LESSON_TITLES[day-1]}</div>`;
              }).join('')}
            </div>
          </div>
        `;
        dayCounter += module.days;
      });

      sidebar.innerHTML = html;
      activateSidebarItem(currentDay);
      console.log("✅ Barra lateral renderizada");
    } catch (error) {
      console.error("❌ Error al renderizar la barra lateral:", error);
    }
  }

  // === FUNCIONES GLOBALES (accesibles desde HTML) ===
  window.toggleModuleIfUnlocked = function(moduleId) {
    if (moduleId === 1) return toggleModule(1);
    if (moduleId === 2 && !isModule1Complete()) return alert("⚠️ Completa 5 lecciones del Módulo 1.");
    if (moduleId === 3 && !isModule2Complete()) return alert("⚠️ Completa 5 lecciones del Módulo 2.");
    if (moduleId === 4 && !isModule3Complete()) return alert("⚠️ Completa 6 lecciones del Módulo 3.");
    toggleModule(moduleId);
  };

  window.showLessonIfUnlocked = function(day) {
    if (isDayUnlocked(day)) {
      showLesson(day);
    } else {
      alert("⚠️ Debes completar el módulo anterior.");
    }
  };

  function toggleModule(moduleId) {
    const el = document.getElementById(`module${moduleId}`);
    if (el) {
      el.style.display = el.style.display === 'block' ? 'none' : 'block';
    }
  }

  function activateSidebarItem(day) {
    document.querySelectorAll('.lesson-item').forEach(item => {
      item.classList.remove('active');
    });
    const item = document.querySelector(`.lesson-item[data-day="${day}"]`);
    if (item) item.classList.add('active');
  }

  // === RENDERIZADO DE LECCIONES ===
  function showLesson(day) {
    currentDay = day;
    const container = document.getElementById('lessonsContainer');
    if (!container) {
      console.error("❌ Elemento #lessonsContainer no encontrado");
      return;
    }

    const isLast = (day === TOTAL_DAYS);
    const exportBtn = isLast ? 
      `<div style="margin-top:15px;"><button class="btn-copy" onclick="exportNotesToPDF()" style="background:var(--primary);padding:8px 16px;font-size:0.95em;">📄 Exportar todas mis notas como PDF</button></div>` : '';

    container.innerHTML = `
      <div class="lesson-content active">
        <div class="lesson-header"><h2>Día ${day}: ${LESSON_TITLES[day-1]}</h2></div>
        <div class="lesson-text">${LESSON_TEXTS[day] || '<p>Contenido no disponible.</p>'}</div>
        
        <div class="ia-section">
          <h3>Asistente de IA</h3>
          <div class="ia-columns">
            <div class="ia-column">
              <h4>Cuantitativo</h4>
              <textarea class="ia-prompt" id="prompt-cuan-${day}" data-original="${CUANT_PROMPTS[day-1]}">${CUANT_PROMPTS[day-1]}</textarea>
              <div class="btn-group">
                <button class="btn-copy" onclick="copyText('prompt-cuan-${day}')">Copiar</button>
                <button class="btn-reset" onclick="resetText('prompt-cuan-${day}')">Restaurar</button>
              </div>
            </div>
            <div class="ia-column">
              <h4>Cualitativo</h4>
              <textarea class="ia-prompt" id="prompt-cual-${day}" data-original="${CUAL_PROMPTS[day-1]}">${CUAL_PROMPTS[day-1]}</textarea>
              <div class="btn-group">
                <button class="btn-copy" onclick="copyText('prompt-cual-${day}')">Copiar</button>
                <button class="btn-reset" onclick="resetText('prompt-cual-${day}')">Restaurar</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="notes-section">
          <h3>Mis notas</h3>
          <textarea id="notes-${day}" placeholder="Escribe aquí tus reflexiones..."></textarea>
          ${exportBtn}
        </div>
      </div>
    `;

    // Cargar notas
    const notesEl = document.getElementById(`notes-${day}`);
    if (notesEl) {
      notesEl.value = localStorage.getItem(`notes-${day}`) || '';
      notesEl.addEventListener('input', (e) => {
        localStorage.setItem(`notes-${day}`, e.target.value);
      });
    }

    updateProgressBar();
    updateNavButtons();
    markComplete(day);
  }

  // === UTILIDADES ===
  function updateProgressBar() {
    const bar = document.getElementById('progressBar');
    if (bar) {
      const percent = ((currentDay - 1) / TOTAL_DAYS) * 100;
      bar.style.width = `${percent}%`;
    }
  }

  function updateNavButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (prev) prev.disabled = (currentDay === 1);
    if (next) next.disabled = (currentDay === TOTAL_DAYS);
  }

  function markComplete(day) {
    courseProgress[day] = true;
    localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
    renderSidebar(); // Actualiza visualmente
  }

  function navigate(direction) {
    const newDay = currentDay + direction;
    if (newDay >= 1 && newDay <= TOTAL_DAYS) {
      window.showLessonIfUnlocked(newDay);
    }
  }

  // === INICIALIZACIÓN ===
  function initApp() {
    console.log("🚀 Iniciando Mini Campus...");
    
    // Verificar elementos críticos
    if (!document.getElementById('sidebar')) {
      console.error("❌ Falta el elemento #sidebar en index.html");
      return;
    }
    if (!document.getElementById('lessonsContainer')) {
      console.error("❌ Falta el elemento #lessonsContainer en index.html");
      return;
    }

    renderSidebar();
    updateProgressBar();
    updateNavButtons();
    showLesson(1);

    // Eventos de navegación
    document.getElementById('prevBtn')?.addEventListener('click', () => navigate(-1));
    document.getElementById('nextBtn')?.addEventListener('click', () => navigate(1));

    // Teclas
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    console.log("✅ Mini Campus cargado correctamente");
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();