const CAMPUS_CONFIG = {
  title: "Mini Campus: Reto Tesis en 30 Días",
  description: "Presentación teórica completa para docentes y estudiantes avanzados. Basado en las referencias clásicas de metodología de la investigación.",
  totalDays: 30,
  authors: "Hernández Sampieri et al. (2014), Creswell (2013), Bisquerra (2009), Lincoln & Guba (1985)",

  modules: [
    {
      id: 1,
      title: "Módulo 1: Planteamiento",
      days: [1, 2, 3, 4, 5, 6, 7],
      unlockRequirement: null
    },
    {
      id: 2,
      title: "Módulo 2: Marco teórico",
      days: [8, 9, 10, 11, 12, 13, 14],
      unlockRequirement: { module: 1, minCompleted: 5 }
    },
    {
      id: 3,
      title: "Módulo 3: Metodología",
      days: [15, 16, 17, 18, 19, 20, 21, 22],
      unlockRequirement: { module: 2, minCompleted: 5 }
    },
    {
      id: 4,
      title: "Módulo 4: Redacción y cierre",
      days: [23, 24, 25, 26, 27, 28, 29, 30],
      unlockRequirement: { module: 3, minCompleted: 6 }
    }
  ],

  progress: {
    showPercentage: true,
    autoMarkVisitedAsComplete: false,
    saveProgressKey: 'courseProgress',
    notesPrefix: 'notes-'
  },

  export: {
    pdfFileName: 'Mis-Notas-Reto-Tesis-30-Dias.pdf',
    includeEmptyDays: false,
    headerTitle: "Mis Notas del Reto: Tesis en 30 Días"
  },

  messages: {
    moduleLocked: (moduleId) => {
      const req = CAMPUS_CONFIG.modules.find(m => m.id === moduleId)?.unlockRequirement;
      if (!req) return "⚠️ Módulo bloqueado.";
      return `⚠️ Debes completar al menos ${req.minCompleted} lecciones del Módulo ${req.module} para acceder.`;
    },
    dayLocked: (day) => {
      const module = CAMPUS_CONFIG.modules.find(m => m.days.includes(day));
      if (!module || module.id === 1) return "⚠️ Lección bloqueada.";
      const req = module.unlockRequirement;
      return `⚠️ Debes completar al menos ${req.minCompleted} lecciones del Módulo ${req.module} para acceder.`;
    },
    copied: "¡Copiado!",
    restored: "Restaurado"
  },

  getModuleById(moduleId) {
    return this.modules.find(m => m.id === moduleId);
  },

  getModuleByDay(day) {
    return this.modules.find(m => m.days.includes(day));
  },

  isModuleUnlocked(moduleId, progress = {}) {
    if (moduleId === 1) return true;
    
    const module = this.getModuleById(moduleId);
    if (!module || !module.unlockRequirement) return false;
    
    const req = module.unlockRequirement;
    const prevModule = this.getModuleById(req.module);
    if (!prevModule) return false;
    
    let completed = 0;
    prevModule.days.forEach(day => {
      if (progress[day]) completed++;
    });
    
    return completed >= req.minCompleted;
  },

  isDayUnlocked(day, progress = {}) {
    const module = this.getModuleByDay(day);
    return this.isModuleUnlocked(module.id, progress);
  },

  countCompletedInModule(moduleId, progress = {}) {
    const module = this.getModuleById(moduleId);
    if (!module) return 0;
    return module.days.filter(day => progress[day]).length;
  }
};