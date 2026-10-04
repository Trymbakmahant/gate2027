'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  MASTER_SCHEDULE,
  SUBJECT_COLORS,
  STUDY_STRUCTURE,
  TARGET_PROGRESSION,
} from '@/data/scheduleData';
import {
  DaySchedule,
  DayProgressData,
  MistakeLogData,
  MockScoreData,
  LinkItem,
  ConfidenceRating,
  RoutineBlock,
  SubTaskItem,
} from '@/types';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export type ThemeMode = 'cream-black' | 'all-black' | 'cream-white';

export default function GateTrackerApp() {
  // --- Theme State ---
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('cream-black');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gate2027_theme') as ThemeMode | null;
      if (saved && (saved === 'cream-black' || saved === 'all-black' || saved === 'cream-white')) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'cream-black');
      }
    } catch (e) {}
  }, []);

  const handleThemeChange = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem('gate2027_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
    const themeNames: Record<ThemeMode, string> = {
      'cream-black': 'Cream & Black Border',
      'all-black': 'All Black (Obsidian Dark)',
      'cream-white': 'Cream BG with White Border',
    };
    showToast(`Switched theme: ${themeNames[theme]}`, 'info');
  };

  // --- Dynamic Today Calculation ---
  const getTodayId = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    if (MASTER_SCHEDULE.some((item) => item.id === dateStr)) {
      return dateStr;
    }
    return MASTER_SCHEDULE[0].id; // Defaults to starting day (2026-10-04)
  };

  const actualTodayId = useMemo(() => getTodayId(), []);

  // --- State ---
  const [activeTab, setActiveTab] = useState<string>('tab-schedule');
  const [currentDayId, setCurrentDayId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gate2027_active_day');
        if (saved && MASTER_SCHEDULE.some((d) => d.id === saved)) {
          return saved;
        }
      } catch (e) {}
    }
    return getTodayId();
  });

  const [isTodaySpotlightCollapsed, setIsTodaySpotlightCollapsed] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [showScrollToTopFab, setShowScrollToTopFab] = useState<boolean>(false);

  const [mongoStatus, setMongoStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [mongoDbName, setMongoDbName] = useState<string>('gate2027');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Local mirror of progress and database data
  const [daysData, setDaysData] = useState<Record<string, DayProgressData>>({});
  const [mistakes, setMistakes] = useState<MistakeLogData[]>([]);
  const [mockScores, setMockScores] = useState<Record<string, MockScoreData>>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Track scroll position for mobile Floating Action Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollToTopFab(true);
      } else {
        setShowScrollToTopFab(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modal States
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalConfidence, setModalConfidence] = useState<ConfidenceRating>(null);
  const [modalLinks, setModalLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [newLinkType, setNewLinkType] = useState<'reference' | 'video' | 'pyq' | 'notes'>('reference');

  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState<boolean>(false);
  const [mistakeForm, setMistakeForm] = useState<{
    question: string;
    date: string;
    topic: string;
    subject: string;
    errorType: string;
    reason: string;
    actionTaken: string;
    referenceUrl: string;
  }>({
    question: '',
    date: '2026-10-04',
    topic: '',
    subject: 'Probability & Statistics',
    errorType: 'Forgot Bayes',
    reason: '',
    actionTaken: '',
    referenceUrl: '',
  });
  const [mistakeFilterType, setMistakeFilterType] = useState<string>('all');
  const [mistakeSearch, setMistakeSearch] = useState<string>('');

  const [isMockModalOpen, setIsMockModalOpen] = useState<boolean>(false);
  const [mockForm, setMockForm] = useState<{
    checkpointId: string;
    score: number | '';
    targetScore: string;
    notes: string;
  }>({
    checkpointId: 'Oct 4 Diagnostic',
    score: '',
    targetScore: '30–40 Baseline',
    notes: '',
  });

  // Timer State
  const [timerBlockKey, setTimerBlockKey] = useState<string>('concept');
  const [timerBlockName, setTimerBlockName] = useState<string>('Concept Study');
  const [timerBlockDesc, setTimerBlockDesc] = useState<string>(
    "Learn the day's core topic & theoretical derivations."
  );
  const [timerSeconds, setTimerSeconds] = useState<number>(150 * 60); // 2.5 hours default
  const [totalTimerSeconds, setTotalTimerSeconds] = useState<number>(150 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Play audio chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.3);
      });
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  // Fetch initial data from MongoDB API
  useEffect(() => {
    async function loadData() {
      try {
        setMongoStatus('connecting');
        const res = await fetch('/api/progress');
        const data = await res.json();
        if (data.success) {
          setDaysData(data.daysData || {});
          setMistakes(data.mistakes || []);
          setMockScores(data.mockScores || {});
          setMongoStatus('connected');
        } else {
          setMongoStatus('error');
        }
      } catch (err) {
        console.error('Failed to load data from MongoDB API:', err);
        setMongoStatus('error');
      }
    }
    loadData();
  }, []);

  // Sync a single day's update to MongoDB
  const persistDayToMongo = async (dayId: string, updates: Partial<DayProgressData>) => {
    setIsSyncing(true);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, ...updates }),
      });
    } catch (e) {
      console.error('Failed to sync day to MongoDB:', e);
      showToast('Offline: saved locally, will sync when reconnected', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle master day complete
  const handleToggleDayComplete = (dayId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const current = daysData[dayId] || {
      dayId,
      completed: false,
      status: 'pending',
      notes: '',
      links: [],
      subTasks: {},
      hoursLogged: 0,
    };
    const updated: DayProgressData = {
      ...current,
      dayId,
      completed: isChecked,
      status: isChecked ? 'completed' : 'pending',
    };

    setDaysData((prev) => ({ ...prev, [dayId]: updated }));
    persistDayToMongo(dayId, updated);

    if (isChecked) {
      playChime();
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      showToast(`Completed day ${dayId}! Great discipline!`, 'success');
    }
  };

  // Toggle routine subtask
  const handleToggleSubtask = (
    dayId: string,
    subKey: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;
    const current = daysData[dayId] || {
      dayId,
      completed: false,
      status: 'pending',
      notes: '',
      links: [],
      subTasks: {},
      hoursLogged: 0,
    };
    const subTasks = { ...(current.subTasks || {}) };
    subTasks[subKey] = isChecked;

    const targetDay = MASTER_SCHEDULE.find((d) => d.id === dayId);
    const allDaySubtasks =
      targetDay?.defaultTasks ||
      (targetDay?.isSunday ? STUDY_STRUCTURE.sunday : STUDY_STRUCTURE.weekday);

    const checkedCount = allDaySubtasks.filter((t) => {
      const k = ('id' in t && t.id) || ('key' in t && t.key) || '';
      return subTasks[k] === true;
    }).length;

    const allChecked = allDaySubtasks.length > 0 && checkedCount === allDaySubtasks.length;
    const someChecked = checkedCount > 0;

    let status = current.status || 'pending';
    let completed = current.completed || false;

    if (allChecked) {
      status = 'completed';
      completed = true;
    } else if (someChecked) {
      status = 'in-progress';
      completed = false;
    } else {
      status = 'pending';
      completed = false;
    }

    const updated: DayProgressData = {
      ...current,
      dayId,
      subTasks,
      status,
      completed,
    };

    setDaysData((prev) => ({ ...prev, [dayId]: updated }));
    persistDayToMongo(dayId, updated);

    if (completed && !current.completed) {
      playChime();
      confetti({ particleCount: 60, spread: 65 });
    }
  };

  // Open Notes Modal
  const handleOpenNotes = (dayId: string) => {
    setEditingDayId(dayId);
    const day = daysData[dayId] || {
      dayId,
      completed: false,
      status: 'pending',
      notes: '',
      links: [],
      subTasks: {},
      hoursLogged: 0,
    };
    setModalNotes(day.notes || '');
    setModalConfidence(day.confidence || null);
    setModalLinks(day.links || []);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  // Save Notes Modal
  const handleSaveNotes = () => {
    if (!editingDayId) return;
    const current = daysData[editingDayId] || {
      dayId: editingDayId,
      completed: false,
      status: 'pending',
      notes: '',
      links: [],
      subTasks: {},
      hoursLogged: 0,
    };
    const updated: DayProgressData = {
      ...current,
      dayId: editingDayId,
      notes: modalNotes,
      confidence: modalConfidence,
      links: modalLinks,
    };

    setDaysData((prev) => ({ ...prev, [editingDayId]: updated }));
    persistDayToMongo(editingDayId, updated);
    setEditingDayId(null);
    showToast('Saved notes & links to MongoDB!', 'success');
  };

  // Add Link inside modal
  const handleAddModalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) {
      alert('Please enter a valid URL.');
      return;
    }
    const newLink: LinkItem = {
      id: 'link_' + Date.now(),
      title: newLinkTitle.trim() || newLinkUrl.trim(),
      url: newLinkUrl.trim(),
      type: newLinkType,
      addedAt: new Date(),
    };
    setModalLinks((prev) => [...prev, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveModalLink = (linkId: string) => {
    setModalLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  // Focus in timer
  const handleFocusDayInTimer = (dayId: string) => {
    setCurrentDayId(dayId);
    setActiveTab('tab-timer');
    showToast(`Set ${dayId} as active focus session in Timer!`, 'info');
  };

  // Log mistake from day card
  const handleOpenMistakeFromDay = (day: DaySchedule) => {
    setMistakeForm({
      question: `GATE Practice - ${day.topic.slice(0, 30)}`,
      date: day.id,
      topic: day.topic,
      subject: day.subject,
      errorType: 'Forgot Bayes',
      reason: '',
      actionTaken: '',
      referenceUrl: '',
    });
    setIsMistakeModalOpen(true);
  };

  // Mistake Notebook Submit
  const handleMistakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mistakeForm),
      });
      const data = await res.json();
      if (data.success) {
        setMistakes((prev) => [data.mistake, ...prev]);
        setIsMistakeModalOpen(false);
        showToast('Logged mistake to MongoDB!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving mistake to MongoDB', 'error');
    }
  };

  // Toggle mistake resolved
  const handleToggleMistakeResolved = async (id: string, currentResolved?: boolean) => {
    const updatedResolved = !currentResolved;
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, resolved: updatedResolved } : m))
    );
    try {
      await fetch('/api/mistakes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolved: updatedResolved }),
      });
      showToast('Mistake status updated!', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete mistake
  const handleDeleteMistake = async (id: string) => {
    if (!confirm('Delete this mistake log entry?')) return;
    setMistakes((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/mistakes?id=${id}`, { method: 'DELETE' });
      showToast('Mistake deleted from MongoDB.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Mock Score Submit
  const handleMockScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mockForm.score === '') return;
    try {
      const res = await fetch('/api/mock-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockForm),
      });
      const data = await res.json();
      if (data.success) {
        setMockScores((prev) => ({ ...prev, [mockForm.checkpointId]: data.score }));
        setIsMockModalOpen(false);
        showToast(`Saved score for ${mockForm.checkpointId} to MongoDB!`, 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Timer controls
  const handleSelectRoutineBlock = (block: RoutineBlock) => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerBlockKey(block.key);
    setTimerBlockName(block.name);
    setTimerBlockDesc(block.desc);
    const secs = Math.round(block.hours * 3600);
    setTotalTimerSeconds(secs);
    setTimerSeconds(secs);
  };

  const handleStartTimer = () => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setIsTimerRunning(false);
          playChime();
          confetti({ particleCount: 100, spread: 70 });
          showToast(`🎉 Focus session complete!`, 'success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerSeconds(totalTimerSeconds);
  };

  const handleLogTimerTime = () => {
    const current = daysData[currentDayId] || {
      dayId: currentDayId,
      completed: false,
      status: 'pending',
      notes: '',
      links: [],
      subTasks: {},
      hoursLogged: 0,
    };
    const subTasks = { ...(current.subTasks || {}) };
    subTasks[timerBlockKey] = true;
    const updated: DayProgressData = {
      ...current,
      dayId: currentDayId,
      subTasks,
    };
    setDaysData((prev) => ({ ...prev, [currentDayId]: updated }));
    persistDayToMongo(currentDayId, updated);
    showToast(`Logged ${timerBlockName} to ${currentDayId}!`, 'success');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      daysData,
      mistakes,
      mockScores,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate_da_2027_mongo_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded full JSON backup!', 'success');
  };

  // Import JSON Backup & Sync to Mongo
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        if (json.daysData) setDaysData(json.daysData);
        if (json.mistakes) setMistakes(json.mistakes);
        if (json.mockScores) setMockScores(json.mockScores);

        // Bulk sync to MongoDB
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            daysData: json.daysData,
            errorLogs: json.mistakes,
            mockScores: json.mockScores,
          }),
        });

        showToast('Successfully restored and synced to MongoDB!', 'success');
      } catch (err: any) {
        alert('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Select active day
  const handleSelectDay = (dayId: string) => {
    setCurrentDayId(dayId);
    try {
      localStorage.setItem('gate2027_active_day', dayId);
    } catch (e) {}
  };

  // Toggle master day complete directly (e.g. from Today's Task spotlight)
  const handleToggleDayCompleteDirect = (dayId: string) => {
    const current = daysData[dayId] || {
      dayId,
      completed: false,
      status: 'pending',
      notes: '',
      links: [],
      subTasks: {},
      hoursLogged: 0,
    };
    const isNowCompleted = !current.completed;
    const updated: DayProgressData = {
      ...current,
      dayId,
      completed: isNowCompleted,
      status: isNowCompleted ? 'completed' : 'pending',
    };

    setDaysData((prev) => ({ ...prev, [dayId]: updated }));
    persistDayToMongo(dayId, updated);

    if (isNowCompleted) {
      playChime();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      showToast(`Completed day ${dayId}! Great discipline!`, 'success');
    } else {
      showToast(`Marked day ${dayId} as pending`, 'info');
    }
  };

  // Scroll to today's task spotlight at top
  const handleScrollToToday = () => {
    setActiveTab('tab-schedule');
    handleSelectDay(actualTodayId);
    setTimeout(() => {
      const spotlight = document.getElementById('today-spotlight-card');
      if (spotlight) {
        spotlight.scrollIntoView({ behavior: 'smooth', block: 'start' });
        spotlight.classList.add('spotlight-pulse-highlight');
        setTimeout(() => {
          spotlight.classList.remove('spotlight-pulse-highlight');
        }, 1500);
      }
    }, 100);
  };

  // Countdown to Exam (Feb 6, 2027)
  const [countdown, setCountdown] = useState<{ days: string; hours: string; mins: string }>({
    days: '--',
    hours: '--',
    mins: '--',
  });
  useEffect(() => {
    const examDate = new Date('2027-02-06T09:00:00+05:30').getTime();
    function tick() {
      const now = new Date().getTime();
      const diff = examDate - now;
      if (diff <= 0) {
        setCountdown({ days: '0', hours: '00', mins: '00' });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown({
        days: String(days),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
      });
    }
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtered schedule calculation
  const filteredSchedule = useMemo(() => {
    return MASTER_SCHEDULE.filter((day) => {
      const data = daysData[day.id] || {
        dayId: day.id,
        completed: false,
        status: 'pending',
        notes: '',
        links: [],
        subTasks: {},
        hoursLogged: 0,
      };
      if (selectedMonth !== 'all' && day.month !== selectedMonth) return false;
      if (selectedStatus === 'completed' && !data.completed) return false;
      if (selectedStatus === 'pending' && data.completed) return false;
      if (selectedStatus === 'has_notes') {
        const hasNotes = data.notes && data.notes.trim().length > 0;
        const hasLinks = data.links && data.links.length > 0;
        if (!hasNotes && !hasLinks) return false;
      }
      if (selectedStatus === 'tests' && !day.isTest && !day.isCheckpoint) return false;
      if (selectedTier !== 'all' && day.tier !== selectedTier) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTopic = day.topic.toLowerCase().includes(q);
        const matchSubject = day.subject.toLowerCase().includes(q);
        const matchGuidance = (day.guidance || '').toLowerCase().includes(q);
        const matchSubtopics = (day.subTopics || []).some((s) => s.toLowerCase().includes(q));
        const matchNotes = (data.notes || '').toLowerCase().includes(q);
        const matchLinks = (data.links || []).some(
          (l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
        );
        if (
          !matchTopic &&
          !matchSubject &&
          !matchGuidance &&
          !matchSubtopics &&
          !matchNotes &&
          !matchLinks
        ) {
          return false;
        }
      }
      return true;
    });
  }, [daysData, selectedMonth, selectedStatus, selectedTier, searchQuery]);

  // Overall KPIs
  const { completedCount, totalHours, progressPct } = useMemo(() => {
    let completed = 0;
    let hours = 0;
    MASTER_SCHEDULE.forEach((day) => {
      const data = daysData[day.id] || {
        dayId: day.id,
        completed: false,
        status: 'pending',
        notes: '',
        links: [],
        subTasks: {},
        hoursLogged: 0,
      };
      if (data.completed) {
        completed++;
        hours += day.suggestedHours || 7;
      } else {
        const subtasks: SubTaskItem[] =
          day.defaultTasks || (day.isSunday ? STUDY_STRUCTURE.sunday : STUDY_STRUCTURE.weekday);
        if (data.subTasks) {
          subtasks.forEach((t) => {
            const subKey = t.id || t.key || '';
            if (data.subTasks[subKey]) {
              hours += t.hours || 1;
            }
          });
        }
      }
    });
    const pct = Math.round((completed / MASTER_SCHEDULE.length) * 100);
    return { completedCount: completed, totalHours: Math.round(hours), progressPct: pct };
  }, [daysData]);

  // Filtered mistakes
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      if (mistakeFilterType !== 'all' && m.errorType !== mistakeFilterType) return false;
      if (mistakeSearch.trim()) {
        const q = mistakeSearch.toLowerCase().trim();
        const matchQ = m.question.toLowerCase().includes(q);
        const matchT = m.topic.toLowerCase().includes(q);
        const matchR = (m.reason || '').toLowerCase().includes(q);
        const matchA = (m.actionTaken || '').toLowerCase().includes(q);
        if (!matchQ && !matchT && !matchR && !matchA) return false;
      }
      return true;
    });
  }, [mistakes, mistakeFilterType, mistakeSearch]);

  const activeScheduleDay = useMemo(() => {
    return MASTER_SCHEDULE.find((d) => d.id === currentDayId) || MASTER_SCHEDULE[0];
  }, [currentDayId]);

  const actualTodayScheduleDay = useMemo(() => {
    return MASTER_SCHEDULE.find((d) => d.id === actualTodayId) || MASTER_SCHEDULE[0];
  }, [actualTodayId]);

  const activeDayIndex = useMemo(() => {
    return MASTER_SCHEDULE.findIndex((d) => d.id === currentDayId);
  }, [currentDayId]);

  const prevScheduleDay = useMemo(() => {
    return activeDayIndex > 0 ? MASTER_SCHEDULE[activeDayIndex - 1] : null;
  }, [activeDayIndex]);

  const nextScheduleDay = useMemo(() => {
    return activeDayIndex < MASTER_SCHEDULE.length - 1 ? MASTER_SCHEDULE[activeDayIndex + 1] : null;
  }, [activeDayIndex]);

  const activeDayData = useMemo(() => {
    return (
      daysData[currentDayId] || {
        dayId: currentDayId,
        completed: false,
        status: 'pending',
        notes: '',
        links: [],
        subTasks: {},
        hoursLogged: 0,
      }
    );
  }, [daysData, currentDayId]);

  const activeSubtasks: SubTaskItem[] = useMemo(() => {
    return (
      activeScheduleDay.defaultTasks ||
      (activeScheduleDay.isSunday ? STUDY_STRUCTURE.sunday : STUDY_STRUCTURE.weekday)
    );
  }, [activeScheduleDay]);

  const activeCheckedSubtasksCount = useMemo(() => {
    return activeSubtasks.filter((t) => {
      const subKey = t.id || t.key || '';
      return activeDayData.subTasks && activeDayData.subTasks[subKey];
    }).length;
  }, [activeSubtasks, activeDayData]);

  const activeSubtasksProgressPct = useMemo(() => {
    if (!activeSubtasks.length) return 0;
    return Math.round((activeCheckedSubtasksCount / activeSubtasks.length) * 100);
  }, [activeCheckedSubtasksCount, activeSubtasks]);

  const activeSubjectStyle = useMemo(() => {
    return (
      SUBJECT_COLORS[activeScheduleDay.subject] || {
        bg: 'rgba(255,255,255,0.1)',
        text: '#18181b',
        border: '#18181b',
        tier: 'Tier S',
      }
    );
  }, [activeScheduleDay.subject]);

  const activeDayForTimer = activeScheduleDay;

  const timerRoutine = useMemo(() => {
    return activeDayForTimer.isSunday ? STUDY_STRUCTURE.sunday : STUDY_STRUCTURE.weekday;
  }, [activeDayForTimer]);

  const formatTimerDigits = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(
      2,
      '0'
    )}`;
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-main">
          <div className="brand-block">
            <div className="brand-badge-row">
              <div className="brand-badge">
                <span className="live-dot"></span>
                <span className="badge-text">GATE DA 2027 • OFFICIAL PLAN</span>
              </div>
              <div className="mongo-badge" title="Connected to MongoDB Atlas Cluster">
                <span className="mongo-dot"></span>
                <span>
                  {mongoStatus === 'connected'
                    ? `MongoDB: Connected (${mongoDbName})`
                    : mongoStatus === 'connecting'
                    ? 'Connecting to MongoDB...'
                    : 'MongoDB: Offline Mode'}
                </span>
                {isSyncing && <small style={{ color: '#a78bfa', marginLeft: 4 }}>[Syncing...]</small>}
              </div>

              {/* Theme Switcher */}
              <div className="theme-switcher-container">
                <div className="theme-switcher" role="group" aria-label="Theme Switcher">
                  <button
                    type="button"
                    className={`theme-btn ${currentTheme === 'cream-black' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('cream-black')}
                    title="Cream & White with Black Border"
                  >
                    <span className="theme-swatch swatch-cream-black"></span>
                    <span>Cream & Black</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${currentTheme === 'all-black' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('all-black')}
                    title="All Black (Obsidian Dark)"
                  >
                    <span className="theme-swatch swatch-all-black"></span>
                    <span>All Black</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${currentTheme === 'cream-white' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('cream-white')}
                    title="Cream BG with White Border"
                  >
                    <span className="theme-swatch swatch-cream-white"></span>
                    <span>Cream & White Border</span>
                  </button>
                </div>
              </div>
            </div>

            <h1 className="brand-title">
              GATE DA 2027 <span className="gradient-text">Master Tracker</span>
            </h1>
            <p className="brand-subtitle">
              Syllabus Blueprint • 7-Hour Daily Architecture • Notes, Links & Mistake Logger
            </p>
          </div>

          {/* Exam Countdown & Target Score */}
          <div className="header-stats-panel">
            <div className="stat-card countdown-card">
              <div className="stat-label">COUNTDOWN TO GATE 2027</div>
              <div className="countdown-digits">
                <span className="cd-item">
                  <strong>{countdown.days}</strong>
                  <small>days</small>
                </span>
                <span className="cd-sep">:</span>
                <span className="cd-item">
                  <strong>{countdown.hours}</strong>
                  <small>hrs</small>
                </span>
                <span className="cd-sep">:</span>
                <span className="cd-item">
                  <strong>{countdown.mins}</strong>
                  <small>mins</small>
                </span>
              </div>
              <div className="countdown-footer">Exam Window: Feb 6–21, 2027</div>
            </div>

            <div className="stat-card target-card">
              <div className="stat-label">PREPARATION TARGET</div>
              <div className="target-score-display">
                <span className="score-main">45+</span>
                <span className="score-sub">/ 100 Marks</span>
              </div>
              <div className="target-pill">Target: 50–55 Safe Margin</div>
            </div>
          </div>
        </div>

        {/* Global KPI Row (Optimized for Desktop & Mobile) */}
        <div className="global-kpi-bar">
          <div className="kpi-metrics-grid">
            <div className="kpi-item">
              <span className="kpi-title">Completed Days</span>
              <span className="kpi-val">{completedCount} / 126</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-title">Syllabus Progress</span>
              <span className="kpi-val">{progressPct}%</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-title">Hours Invested</span>
              <span className="kpi-val">{totalHours} hrs</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-title">Mistakes Logged</span>
              <span className="kpi-val">{mistakes.length}</span>
            </div>
          </div>

          <div className="kpi-actions">
            <button
              onClick={handleScrollToToday}
              className="btn btn-primary btn-sm"
              title="Jump to Today's Task Spotlight at Top"
            >
              <span>⚡ Today ({actualTodayScheduleDay?.date.split(',')[0] || 'Oct 4'})</span>
            </button>
            <button
              onClick={handleExportBackup}
              className="btn btn-outline btn-sm"
              title="Export backup JSON"
            >
              <span>Backup</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline btn-sm"
              title="Import backup JSON and sync to MongoDB"
            >
              <span>Restore</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Master Progress Fill Track */}
        <div className="progress-track-wrapper">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="main-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'tab-schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('tab-schedule')}
        >
          <span>Daily Master Schedule</span>
          <span className="tab-badge">126 Days</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tab-timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('tab-timer')}
        >
          <span>7-Hour Focus Timer</span>
          <span className="tab-pill">Daily Command</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tab-mistakes' ? 'active' : ''}`}
          onClick={() => setActiveTab('tab-mistakes')}
        >
          <span>GATE DA Mistake Book</span>
          <span className="tab-badge">{mistakes.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tab-trajectory' ? 'active' : ''}`}
          onClick={() => setActiveTab('tab-trajectory')}
        >
          <span>Score Progression</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tab-strategy' ? 'active' : ''}`}
          onClick={() => setActiveTab('tab-strategy')}
        >
          <span>Rules & Tier Strategy</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* ============================================================== */}
        {/* TAB 1: DAILY MASTER SCHEDULE                                   */}
        {/* ============================================================== */}
        {activeTab === 'tab-schedule' && (
          <section className="tab-pane active">
            {/* ============================================================== */}
            {/* PINNED HERO: TODAY'S TASK / DAILY MISSION                      */}
            {/* ============================================================== */}
            <div className="today-spotlight-wrapper" id="today-spotlight-card">
              <div className={`today-spotlight-card ${activeDayData.completed ? 'completed' : ''}`}>
                {/* Header / Ribbon */}
                <div className="spotlight-header-row">
                  <div className="spotlight-title-group">
                    <span className="spotlight-live-badge">
                      <span className="live-dot pulse-fast"></span>
                      <span className="spotlight-badge-text">
                        {currentDayId === actualTodayId ? "TODAY'S MISSION" : "DAILY FOCUS"}
                      </span>
                    </span>
                    <div className="spotlight-date-meta">
                      <strong className="spotlight-date-text">{activeScheduleDay.date}</strong>
                      <span className="spotlight-dow-text">• {activeScheduleDay.dayOfWeek}</span>
                      <span className="spotlight-day-index">Day {activeDayIndex + 1} of {MASTER_SCHEDULE.length}</span>
                    </div>
                  </div>

                  <div className="spotlight-nav-group">
                    <button
                      type="button"
                      className="spotlight-nav-btn"
                      disabled={!prevScheduleDay}
                      onClick={() => prevScheduleDay && handleSelectDay(prevScheduleDay.id)}
                      title={prevScheduleDay ? `Previous Day: ${prevScheduleDay.date}` : 'No previous day'}
                    >
                      ◀ Prev
                    </button>
                    {currentDayId !== actualTodayId && (
                      <button
                        type="button"
                        className="spotlight-today-jump-btn"
                        onClick={() => handleSelectDay(actualTodayId)}
                        title="Jump to Today's Actual Calendar Date"
                      >
                        ⚡ Today
                      </button>
                    )}
                    <button
                      type="button"
                      className="spotlight-nav-btn"
                      disabled={!nextScheduleDay}
                      onClick={() => nextScheduleDay && handleSelectDay(nextScheduleDay.id)}
                      title={nextScheduleDay ? `Next Day: ${nextScheduleDay.date}` : 'No next day'}
                    >
                      Next ▶
                    </button>
                    <button
                      type="button"
                      className="spotlight-collapse-btn"
                      onClick={() => setIsTodaySpotlightCollapsed(!isTodaySpotlightCollapsed)}
                      title={isTodaySpotlightCollapsed ? 'Expand Today Card' : 'Minimize Today Card'}
                    >
                      {isTodaySpotlightCollapsed ? 'Expand ▼' : 'Minimize ▲'}
                    </button>
                  </div>
                </div>

                {!isTodaySpotlightCollapsed && (
                  <div className="spotlight-body">
                    {/* Meta Badges Row */}
                    <div className="spotlight-meta-badges">
                      <span
                        className="subject-badge spotlight-subject-badge"
                        style={{
                          background: activeSubjectStyle.bg,
                          color: activeSubjectStyle.text,
                          borderColor: activeSubjectStyle.border,
                        }}
                      >
                        {activeScheduleDay.subject}
                      </span>
                      <span
                        className={`tier-badge ${
                          activeScheduleDay.tier === 'Tier S'
                            ? 'tier-s'
                            : activeScheduleDay.tier === 'Tier A'
                            ? 'tier-a'
                            : 'tier-b'
                        }`}
                      >
                        {activeScheduleDay.tier}
                      </span>
                      {activeScheduleDay.isTest && (
                        <span className="test-badge">📝 Test / Diagnostic</span>
                      )}
                      {activeScheduleDay.milestone && (
                        <span className="milestone-badge">⭐ {activeScheduleDay.milestone}</span>
                      )}
                      <span className="hours-target-badge">
                        ⏱️ {activeScheduleDay.suggestedHours || 7}h Target
                      </span>
                      {activeDayData.completed ? (
                        <span className="status-badge-completed">✅ Completed</span>
                      ) : activeCheckedSubtasksCount > 0 ? (
                        <span
                          className="status-badge-inprogress"
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1.5px solid var(--border-black)',
                            borderRadius: 4,
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                          }}
                        >
                          🟡 In Progress ({activeCheckedSubtasksCount}/{activeSubtasks.length})
                        </span>
                      ) : (
                        <span
                          className="status-badge-pending"
                          style={{
                            background: 'var(--bg-surface-subtle)',
                            color: 'var(--text-secondary)',
                            border: '1.5px solid var(--border-black)',
                            borderRadius: 4,
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          ⏳ Pending
                        </span>
                      )}
                    </div>

                    {/* Topic Title */}
                    <h2 className="spotlight-topic-title">
                      {activeScheduleDay.topic}
                    </h2>

                    {/* Subtopics */}
                    {activeScheduleDay.subTopics && activeScheduleDay.subTopics.length > 0 && (
                      <div className="spotlight-subtopics-row">
                        {activeScheduleDay.subTopics.map((st, i) => (
                          <span key={i} className="subtopic-pill">
                            {st}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Guidance Box */}
                    {activeScheduleDay.guidance && (
                      <div className="spotlight-guidance-box">
                        <span className="guidance-icon">💡</span>
                        <div className="guidance-content">
                          <strong>Study Strategy:</strong> {activeScheduleDay.guidance}
                        </div>
                      </div>
                    )}

                    {/* 7-Hour Architecture Checklist */}
                    <div className="spotlight-checklist-section">
                      <div className="spotlight-checklist-header">
                        <div className="checklist-heading-group">
                          <span className="checklist-heading-title">Today&apos;s 7-Hour Architecture</span>
                          <span className="checklist-count-pill">
                            {activeCheckedSubtasksCount} / {activeSubtasks.length} Done ({activeSubtasksProgressPct}%)
                          </span>
                        </div>
                        <div className="spotlight-progress-mini">
                          <div
                            className="spotlight-progress-fill"
                            style={{ width: `${activeSubtasksProgressPct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Subtasks Grid */}
                      <div className="spotlight-subtasks-grid">
                        {activeSubtasks.map((task, idx) => {
                          const subKey = task.id || task.key || `task-${idx}`;
                          const isChecked = !!(activeDayData.subTasks && activeDayData.subTasks[subKey]);
                          return (
                            <label
                              key={subKey}
                              className={`spotlight-task-item ${isChecked ? 'checked' : ''}`}
                            >
                              <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={isChecked}
                                onChange={(e) => handleToggleSubtask(activeScheduleDay.id, subKey, e)}
                              />
                              <div className="task-info">
                                <span className="task-label">{task.label || task.name}</span>
                                {task.desc && <span className="task-desc">{task.desc}</span>}
                              </div>
                              <span className="task-hours-badge">{task.hours}h</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons Bar */}
                    <div className="spotlight-actions-bar">
                      <button
                        type="button"
                        onClick={() => handleFocusDayInTimer(activeScheduleDay.id)}
                        className="btn btn-primary spotlight-action-btn"
                      >
                        <span>⏱️ Focus in Timer (7h)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenNotes(activeScheduleDay.id)}
                        className="btn btn-secondary spotlight-action-btn"
                      >
                        <span>
                          📝 Notes & Links{' '}
                          {activeDayData.links?.length ? `(${activeDayData.links.length})` : ''}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenMistakeFromDay(activeScheduleDay)}
                        className="btn btn-outline spotlight-action-btn"
                      >
                        <span>🚨 Log Mistake</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleDayCompleteDirect(activeScheduleDay.id)}
                        className={`btn spotlight-action-btn ${
                          activeDayData.completed ? 'btn-outline' : 'btn-success'
                        }`}
                      >
                        <span>
                          {activeDayData.completed ? '↩ Mark Incomplete' : '✅ Mark Day Complete'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter and Search Panel */}
            <div className="schedule-controls-panel">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search topic (e.g. Bayes, SVD, Normalization, PCA, Regr...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-btn" onClick={() => setSearchQuery('')}>
                    ×
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <div className="filter-mobile-toggle-row">
                <button
                  type="button"
                  className="mobile-filter-toggle-btn"
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                  <span>
                    ⚡ Filters ({selectedMonth === 'all' ? 'All Months' : selectedMonth} • {selectedStatus} • {selectedTier})
                  </span>
                  <span className="toggle-arrow">{isMobileFiltersOpen ? '▲ Hide' : '▼ Expand'}</span>
                </button>
              </div>

              <div className={`filter-collapsible-wrapper ${isMobileFiltersOpen ? 'mobile-open' : ''}`}>
                {/* Month Pills */}
                <div className="filter-group month-filters">
                  <span className="filter-group-title">Month:</span>
                  <div className="pill-row">
                    {['all', 'October', 'November', 'December', 'January', 'February'].map((m) => (
                      <button
                        key={m}
                        className={`pill-btn ${selectedMonth === m ? 'active' : ''}`}
                        onClick={() => setSelectedMonth(m)}
                      >
                        {m === 'all'
                          ? 'All'
                          : m === 'October'
                          ? "Oct '26 (Math)"
                          : m === 'November'
                          ? "Nov '26 (LA/Calc)"
                          : m === 'December'
                          ? "Dec '26 (DSA/DB/ML)"
                          : m === 'January'
                          ? "Jan '27 (ML/AI)"
                          : "Feb '27 (Mocks)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Filters */}
                <div className="filter-secondary-row">
                  <div className="filter-group status-filters">
                    <span className="filter-group-title">Status:</span>
                    <div className="pill-row">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'completed', label: 'Completed' },
                        { key: 'has_notes', label: 'Has Notes/Links' },
                        { key: 'tests', label: 'Tests & Checkpoints' },
                      ].map((s) => (
                        <button
                          key={s.key}
                          className={`pill-btn ${selectedStatus === s.key ? 'active' : ''}`}
                          onClick={() => setSelectedStatus(s.key)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group tier-filters">
                    <span className="filter-group-title">Priority Tier:</span>
                    <div className="pill-row">
                      {[
                        { key: 'all', label: 'All Tiers', cls: '' },
                        { key: 'Tier S', label: '🔴 Tier S (Very High)', cls: 'tier-s-btn' },
                        { key: 'Tier A', label: '🟠 Tier A (High)', cls: 'tier-a-btn' },
                        { key: 'Tier B', label: '🟢 Tier B (Medium/Low)', cls: 'tier-b-btn' },
                      ].map((t) => (
                        <button
                          key={t.key}
                          className={`pill-btn ${t.cls} ${selectedTier === t.key ? 'active' : ''}`}
                          onClick={() => setSelectedTier(t.key)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Count Bar */}
            <div className="schedule-summary-bar">
              <span>
                Showing {filteredSchedule.length} of {MASTER_SCHEDULE.length} days
              </span>
              <div className="legend-items">
                <span className="legend-item">
                  <span className="conf-dot dot-g"></span> G = Mastered
                </span>
                <span className="legend-item">
                  <span className="conf-dot dot-y"></span> Y = Minor Slip
                </span>
                <span className="legend-item">
                  <span className="conf-dot dot-r"></span> R = Review Needed
                </span>
              </div>
            </div>

            {/* Schedule List */}
            <div className="schedule-list-grid">
              {filteredSchedule.map((day) => {
                const data = daysData[day.id] || {
                  dayId: day.id,
                  completed: false,
                  status: 'pending',
                  notes: '',
                  links: [],
                  subTasks: {},
                  hoursLogged: 0,
                };
                const isCompleted = !!data.completed;
                const isToday = day.id === actualTodayId;
                const isActiveFocus = day.id === currentDayId;
                const subjectStyle = SUBJECT_COLORS[day.subject] || {
                  bg: 'rgba(255,255,255,0.1)',
                  text: '#fff',
                  border: 'rgba(255,255,255,0.2)',
                };
                const hasNotes = data.notes && data.notes.trim().length > 0;
                const hasLinks = data.links && data.links.length > 0;
                const confidence = data.confidence;

                const subtasks: SubTaskItem[] =
                  day.defaultTasks ||
                  (day.isSunday ? STUDY_STRUCTURE.sunday : STUDY_STRUCTURE.weekday);
                const checkedSubtasksCount = subtasks.filter((t) => {
                  const subKey = t.id || t.key || '';
                  return data.subTasks && data.subTasks[subKey];
                }).length;

                return (
                  <div
                    key={day.id}
                    id={`card-${day.id}`}
                    className={`day-card ${isCompleted ? 'completed' : ''} ${
                      isToday ? 'is-today' : ''
                    } ${isActiveFocus ? 'is-active-focus' : ''} ${day.isTest ? 'is-test' : ''}`}
                  >
                    <div className="day-card-main-row">
                      {/* Day Master Checkbox */}
                      <div className="day-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={isCompleted}
                          onChange={(e) => handleToggleDayComplete(day.id, e)}
                          title="Mark entire day complete"
                        />
                      </div>

                      {/* Day Content */}
                      <div className="day-content-wrap">
                        <div className="day-meta-row">
                          <span className="day-date-badge">{day.date}</span>
                          <span className="day-dow">• {day.dayOfWeek}</span>
                          <span
                            className="subject-badge"
                            style={{
                              background: subjectStyle.bg,
                              color: subjectStyle.text,
                              borderColor: subjectStyle.border,
                            }}
                          >
                            {day.subject}
                          </span>
                          <span
                            className={`tier-badge ${
                              day.tier === 'Tier S'
                                ? 'tier-s'
                                : day.tier === 'Tier A'
                                ? 'tier-a'
                                : 'tier-b'
                            }`}
                          >
                            {day.tier}
                          </span>
                          {day.isTest && (
                            <span className="test-badge">{day.milestone || 'TEST'}</span>
                          )}

                          {confidence && (
                            <span className={`conf-badge conf-${confidence.toLowerCase()}`}>
                              <span
                                className={`conf-dot dot-${confidence.toLowerCase()}`}
                              ></span>{' '}
                              {confidence === 'G'
                                ? 'Got It'
                                : confidence === 'Y'
                                ? 'Minor Slip'
                                : 'Need Review'}
                            </span>
                          )}
                        </div>

                        <h3 className="day-topic-title">{day.topic}</h3>

                        {day.guidance && (
                          <div className="day-guidance-note">💡 {day.guidance}</div>
                        )}

                        {day.subTopics && day.subTopics.length > 0 && (
                          <div className="day-subtopics-list">
                            {day.subTopics.map((sub, i) => (
                              <span key={i} className="subtopic-pill">
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Embedded Notes & Links Preview */}
                        {(hasNotes || hasLinks) && (
                          <div className="day-preview-container">
                            {hasNotes && (
                              <div className="notes-preview-box">
                                <strong>Notes:</strong> {data.notes.slice(0, 160)}
                                {data.notes.length > 160 ? '...' : ''}
                              </div>
                            )}
                            {hasLinks && (
                              <div className="links-preview-row">
                                {data.links.map((link) => (
                                  <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-pill"
                                    title={link.url}
                                  >
                                    <span>🔗 {link.title || link.url}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 7-Hour Daily Subtasks Drawer */}
                        <div className="subtasks-drawer">
                          <div className="subtasks-drawer-header">
                            <span>
                              7-Hour Routine ({checkedSubtasksCount} / {subtasks.length} done)
                            </span>
                            <span>{day.suggestedHours || 7}h target</span>
                          </div>
                          <div className="subtasks-grid">
                            {subtasks.map((t) => {
                              const subKey = t.id || t.key || '';
                              const isChecked = !!(data.subTasks && data.subTasks[subKey]);
                              return (
                                <label
                                  key={subKey}
                                  className={`subtask-item ${isChecked ? 'checked' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="subtask-checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleToggleSubtask(day.id, subKey, e)}
                                  />
                                  <span>
                                    {t.name || t.label} ({t.hours}h)
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Buttons Bar */}
                        <div className="day-actions-bar">
                          <button
                            onClick={() => handleOpenNotes(day.id)}
                            className={`day-action-btn ${
                              hasNotes || hasLinks || confidence ? 'has-content' : ''
                            }`}
                          >
                            <span>{hasNotes ? 'Edit Notes' : '+ Add Notes'} & Links</span>
                            {hasLinks && (
                              <span
                                className="badge-text"
                                style={{
                                  background: 'rgba(14,165,233,0.3)',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                }}
                              >
                                {data.links.length} links
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              handleSelectDay(day.id);
                              const spotlight = document.getElementById('today-spotlight-card');
                              if (spotlight) {
                                spotlight.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                spotlight.classList.add('spotlight-pulse-highlight');
                                setTimeout(() => spotlight.classList.remove('spotlight-pulse-highlight'), 1500);
                              }
                            }}
                            className="day-action-btn"
                            title="Focus on this day at the top"
                          >
                            <span>📌 View at Top</span>
                          </button>

                          <button
                            onClick={() => handleFocusDayInTimer(day.id)}
                            className="day-action-btn"
                            title="Set this day as active focus in 7-Hour Timer"
                          >
                            <span>Focus in Timer</span>
                          </button>

                          <button
                            onClick={() => handleOpenMistakeFromDay(day)}
                            className="day-action-btn"
                            title="Log a question mistake for this topic"
                          >
                            <span>Log Mistake</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 7-HOUR FOCUS TIMER & COMMAND CENTER                     */}
        {/* ============================================================== */}
        {activeTab === 'tab-timer' && (
          <section className="tab-pane active">
            <div className="timer-dashboard">
              <div className="timer-main-card">
                <div className="timer-header">
                  <div>
                    <span className="timer-tag">
                      {timerBlockKey.toUpperCase().replace('_', ' ')}
                    </span>
                    <h2 className="timer-title">
                      {timerBlockName} ({Math.round(totalTimerSeconds / 3600)} Hours)
                    </h2>
                    <p className="timer-sub">{timerBlockDesc}</p>
                  </div>
                  <div className="timer-current-day-badge">
                    Active Day: {activeDayForTimer.date} ({activeDayForTimer.subject})
                  </div>
                </div>

                <div className="timer-display-wrap">
                  <div className="timer-time">{formatTimerDigits(timerSeconds)}</div>
                  <div
                    className="timer-status-indicator"
                    style={{
                      color: isTimerRunning ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    }}
                  >
                    {isTimerRunning ? 'Focusing... Stay Off Distractions' : 'Ready to Focus'}
                  </div>
                </div>

                <div className="timer-controls">
                  {!isTimerRunning ? (
                    <button onClick={handleStartTimer} className="btn btn-primary btn-lg">
                      <span>Start Focus Session</span>
                    </button>
                  ) : (
                    <button onClick={handlePauseTimer} className="btn btn-secondary btn-lg">
                      <span>Pause</span>
                    </button>
                  )}
                  <button onClick={handleResetTimer} className="btn btn-outline btn-lg">
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleLogTimerTime}
                    className="btn btn-success btn-lg"
                    title="Log session to MongoDB"
                  >
                    <span>Log Time to MongoDB</span>
                  </button>
                </div>

                <div className="timer-routine-selector">
                  <div className="routine-title-row">
                    <h3>Daily 7-Hour Architecture</h3>
                    <span className="routine-mode-badge">
                      {activeDayForTimer.isSunday
                        ? 'Sunday Revision & Test Structure'
                        : 'Monday–Saturday Structure'}
                    </span>
                  </div>
                  <div className="routine-grid">
                    {timerRoutine.map((block) => (
                      <button
                        key={block.key}
                        className={`routine-btn ${
                          block.key === timerBlockKey ? 'active' : ''
                        }`}
                        onClick={() => handleSelectRoutineBlock(block)}
                      >
                        <span className="routine-btn-title">{block.name}</span>
                        <span className="routine-btn-hours">
                          {block.hours} Hours ({Math.round(block.hours * 60)} min)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="timer-sidebar">
                <div className="glass-card rules-card">
                  <h3>Daily 7-Hour Golden Rule</h3>
                  <ul className="golden-rules-list">
                    <li>
                      <strong>Concept (2.5h):</strong> Learn the day's core topic. Do not spend
                      7 hours passively watching video courses!
                    </li>
                    <li>
                      <strong>Problems (2.0h):</strong> Solve without looking at solutions first.
                    </li>
                    <li>
                      <strong>GATE PYQs (1.5h):</strong> Actual GATE-style questions under timed
                      conditions.
                    </li>
                    <li>
                      <strong>GA (30 min):</strong> Never skip General Aptitude. 15 free marks!
                    </li>
                    <li>
                      <strong>Revision (30 min):</strong> Formula recall & error notebook log entry.
                    </li>
                  </ul>
                </div>

                <div className="glass-card pyq-rule-card">
                  <h3>The 4-Pass PYQ Rule</h3>
                  <ol className="pyq-steps">
                    <li>
                      <strong>1st Pass:</strong> Solve without time pressure
                    </li>
                    <li>
                      <strong>2nd Pass:</strong> Solve without notes / formulas
                    </li>
                    <li>
                      <strong>3rd Pass:</strong> Solve under strict time pressure
                    </li>
                    <li>
                      <strong>4th Pass:</strong> Revisit your mistakes & log them
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GATE DA MISTAKE NOTEBOOK                                */}
        {/* ============================================================== */}
        {activeTab === 'tab-mistakes' && (
          <section className="tab-pane active">
            <div className="mistakes-dashboard">
              <div className="mistakes-header">
                <div>
                  <h2>GATE DA Mistake Notebook (MongoDB Connected)</h2>
                  <p className="section-desc">
                    &ldquo;You should eventually have a GATE DA mistake book, not just a notebook full
                    of formulas.&rdquo; Log every wrong or skipped question: Question | Error |
                    Reason | Action.
                  </p>
                </div>
                <button
                  onClick={() => setIsMistakeModalOpen(true)}
                  className="btn btn-primary"
                >
                  <span>+ Log New Mistake</span>
                </button>
              </div>

              <div className="mistakes-filter-bar">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search mistakes by question, topic, reason, or fix..."
                    value={mistakeSearch}
                    onChange={(e) => setMistakeSearch(e.target.value)}
                  />
                </div>
                <div className="pill-row">
                  {[
                    'all',
                    'Forgot Bayes',
                    'Calculation',
                    "Didn't know concept",
                    'Too slow',
                    'Misread question',
                  ].map((type) => (
                    <button
                      key={type}
                      className={`pill-btn ${mistakeFilterType === type ? 'active' : ''}`}
                      onClick={() => setMistakeFilterType(type)}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mistakes-table-wrapper glass-panel">
                <table className="mistakes-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Status</th>
                      <th style={{ width: 110 }}>Date</th>
                      <th style={{ width: 140 }}>Question #</th>
                      <th style={{ width: 180 }}>Topic & Subject</th>
                      <th style={{ width: 150 }}>Error Category</th>
                      <th>Reason for Mistake</th>
                      <th>Action / Remedy</th>
                      <th style={{ width: 100 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMistakes.map((err) => (
                      <tr key={err.id} className={err.resolved ? 'resolved' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={!!err.resolved}
                            onChange={() => handleToggleMistakeResolved(err.id, err.resolved)}
                            title="Mark resolved/fixed in MongoDB"
                          />
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                          {err.date}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{err.question}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{err.topic}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {err.subject}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`error-tag ${
                              err.errorType === 'Forgot Bayes'
                                ? 'err-bayes'
                                : err.errorType === 'Calculation'
                                ? 'err-calc'
                                : err.errorType === 'Too slow'
                                ? 'err-slow'
                                : 'err-concept'
                            }`}
                          >
                            {err.errorType}
                          </span>
                        </td>
                        <td>{err.reason || '—'}</td>
                        <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{err.actionTaken || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {err.referenceUrl && (
                              <a
                                href={err.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="day-action-btn"
                                title="Open reference link"
                              >
                                🔗
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteMistake(err.id)}
                              className="day-action-btn"
                              title="Delete mistake"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredMistakes.length === 0 && (
                  <div className="empty-state">
                    <p>No mistakes logged matching this filter. Keep practicing questions!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SCORE PROGRESSION & CHECKPOINTS                         */}
        {/* ============================================================== */}
        {activeTab === 'tab-trajectory' && (
          <section className="tab-pane active">
            <div className="trajectory-dashboard">
              <div className="trajectory-header">
                <h2>Expected Score Progression & Checkpoints</h2>
                <p className="section-desc">
                  These are progression targets, not predictions. If you score 40+ consistently in full
                  mocks, you are in top rank contention.
                </p>
              </div>

              <div className="milestones-grid">
                {TARGET_PROGRESSION.map((m, i) => (
                  <div key={i} className="milestone-card">
                    <div className="milestone-date">{m.date}</div>
                    <div className="milestone-target">{m.target}</div>
                    <p className="milestone-desc">{m.desc}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card checkpoint-history-card">
                <div className="card-header-flex">
                  <h3>Recorded Checkpoint / Mock Scores (in MongoDB)</h3>
                  <button onClick={() => setIsMockModalOpen(true)} className="btn btn-outline btn-sm">
                    <span>+ Record Mock Score</span>
                  </button>
                </div>
                <div className="mock-scores-list">
                  {Object.keys(mockScores).length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                      No mock or checkpoint test scores recorded yet. Click &ldquo;Record Mock Score&rdquo; to log your results!
                    </div>
                  ) : (
                    Object.keys(mockScores).map((key) => {
                      const s = mockScores[key];
                      return (
                        <div key={key} className="mock-score-row">
                          <div className="mock-score-info">
                            <h4>{key}</h4>
                            <p>{s.notes || 'No extra notes logged.'}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="mock-score-badge">{s.score} Marks</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Target: {s.targetScore || '—'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* TAB 5: STRATEGY & SYLLABUS TIERS                               */}
        {/* ============================================================== */}
        {activeTab === 'tab-strategy' && (
          <section className="tab-pane active">
            <div className="strategy-dashboard">
              <div className="tier-breakdown-row">
                <div className="tier-card tier-card-s">
                  <div className="tier-header">
                    <span className="tier-badge tier-s">TIER S • VERY HIGH PRIORITY</span>
                    <h3>Absolutely Master</h3>
                  </div>
                  <p className="tier-desc">
                    The foundation that decides your rank. Maximum marks and deep conceptual questions.
                  </p>
                  <ul className="tier-subjects-list">
                    <li>
                      <strong>Probability & Statistics:</strong> Axioms, conditional probability, Bayes,
                      RVs, PMF/PDF, distributions, CLT, confidence intervals, hypothesis testing (~20
                      days)
                    </li>
                    <li>
                      <strong>Linear Algebra:</strong> Vectors, rank, systems of linear equations,
                      eigenvalues, projections, SVD, quadratic forms (~14 days)
                    </li>
                    <li>
                      <strong>Machine Learning:</strong> Regression, Ridge, Logistic, KNN, Naive Bayes,
                      LDA, SVM, Decision Trees, MLP, Neural Networks, Clustering, PCA (~22 days)
                    </li>
                    <li>
                      <strong>Revision & Full Mocks:</strong> January & February mock exam simulations
                    </li>
                  </ul>
                </div>

                <div className="tier-card tier-card-a">
                  <div className="tier-header">
                    <span className="tier-badge tier-a">TIER A • HIGH PRIORITY</span>
                    <h3>Strong Preparation</h3>
                  </div>
                  <p className="tier-desc">
                    High ROI areas where developers collect consistent marks with standard problem practice.
                  </p>
                  <ul className="tier-subjects-list">
                    <li>
                      <strong>DBMS & Warehousing:</strong> ER models, Relational Algebra, SQL, Functional
                      Dependencies, Normalization, Indexing, OLAP & Data Transformation (~7 days)
                    </li>
                    <li>
                      <strong>Artificial Intelligence:</strong> State-space search, BFS/DFS/UCS, A*
                      heuristics, Minimax with α-β pruning, Propositional & Predicate logic, Bayes Nets &
                      Variable Elimination (~10 days)
                    </li>
                    <li>
                      <strong>General Aptitude:</strong> 15 marks. 30 minutes practice every day without fail.
                    </li>
                  </ul>
                </div>

                <div className="tier-card tier-card-b">
                  <div className="tier-header">
                    <span className="tier-badge tier-b">TIER B • MEDIUM/LOW PRIORITY</span>
                    <h3>Quick Coverage</h3>
                  </div>
                  <p className="tier-desc">
                    Do NOT skip completely! The goal is to collect easy marks without getting bogged down
                    in theory.
                  </p>
                  <ul className="tier-subjects-list">
                    <li>
                      <strong>Programming & Python:</strong> Syntax, lists, dicts, code tracing, edge
                      cases (~2 days)
                    </li>
                    <li>
                      <strong>Data Structures & Algorithms:</strong> Stacks, queues, linked lists, trees,
                      hash tables, search/sort complexity (~3 days)
                    </li>
                    <li>
                      <strong>Calculus & Optimization:</strong> Limits, continuity, derivatives, Taylor
                      series, maxima/minima (~7 days)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="danger-warning-card glass-card">
                <div className="warning-icon">⚠️</div>
                <div>
                  <h4>Your Biggest Danger: The Developer Trap</h4>
                  <p>
                    &ldquo;I already know coding, I&apos;ll easily finish that. I&apos;ll start math tomorrow.&rdquo;
                    <br />
                    Then two weeks disappear. For you, October and November mathematics are the make-or-break period.
                    <br />
                    Your practical development experience gives you a substantial advantage in programming/DB/algorithmic thinking. But GATE will test you on mathematical and theoretical material that you may never have needed in your development work.
                    <br />
                    <strong>Rule:</strong> Watch ML/math lecture → 10 easy questions → 20 GATE questions → analyze mistakes → move on!
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: DAY NOTES & WEB LINKS                                 */}
      {/* ============================================================== */}
      {editingDayId && (
        <div className="app-dialog-backdrop">
          <div className="app-dialog">
            <div className="dialog-content glass-card">
              <div className="dialog-header">
                <div>
                  <span className="dialog-sub">
                    {MASTER_SCHEDULE.find((d) => d.id === editingDayId)?.date} •{' '}
                    {MASTER_SCHEDULE.find((d) => d.id === editingDayId)?.subject}
                  </span>
                  <h3 className="dialog-title">
                    {MASTER_SCHEDULE.find((d) => d.id === editingDayId)?.topic}
                  </h3>
                </div>
                <button
                  className="dialog-close-btn"
                  onClick={() => setEditingDayId(null)}
                >
                  ✕
                </button>
              </div>

              <div className="dialog-body">
                {/* Confidence Selector */}
                <div className="confidence-selector-row">
                  <span className="form-label">Topic Confidence:</span>
                  <div className="confidence-options">
                    <button
                      type="button"
                      className={`conf-btn conf-btn-g ${modalConfidence === 'G' ? 'active' : ''}`}
                      onClick={() => setModalConfidence('G')}
                    >
                      <span className="conf-dot dot-g"></span> Got It (G)
                    </button>
                    <button
                      type="button"
                      className={`conf-btn conf-btn-y ${modalConfidence === 'Y' ? 'active' : ''}`}
                      onClick={() => setModalConfidence('Y')}
                    >
                      <span className="conf-dot dot-y"></span> Minor Slip (Y)
                    </button>
                    <button
                      type="button"
                      className={`conf-btn conf-btn-r ${modalConfidence === 'R' ? 'active' : ''}`}
                      onClick={() => setModalConfidence('R')}
                    >
                      <span className="conf-dot dot-r"></span> Need Review (R)
                    </button>
                    <button
                      type="button"
                      className="conf-btn"
                      onClick={() => setModalConfidence(null)}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Notes Editor */}
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">
                    Daily Study Notes & Key Formulas{' '}
                    <small className="label-hint">(Saved directly to MongoDB)</small>
                  </label>
                  <textarea
                    rows={5}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Write key formulas, definitions, tricky traps, questions solved count, or reminders..."
                  />
                </div>

                {/* Web Links Section */}
                <div className="links-section">
                  <div className="links-section-header">
                    <label className="form-label">Web Links & Resources</label>
                    <span className="label-hint" style={{ display: 'block' }}>
                      Add GateOverflow, YouTube lectures, NPTEL videos, or formula PDFs
                    </span>
                  </div>

                  <form className="add-link-form" onSubmit={handleAddModalLink}>
                    <input
                      type="text"
                      placeholder="Link title (e.g. GateOverflow Bayes PYQ)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                    <select
                      value={newLinkType}
                      onChange={(e) =>
                        setNewLinkType(e.target.value as 'reference' | 'video' | 'pyq' | 'notes')
                      }
                    >
                      <option value="reference">Reference</option>
                      <option value="video">Lecture / Video</option>
                      <option value="pyq">PYQ Question</option>
                      <option value="notes">Notes / PDF</option>
                    </select>
                    <button type="submit" className="btn btn-secondary btn-sm">
                      + Add Link
                    </button>
                  </form>

                  <div className="dialog-links-list">
                    {modalLinks.length === 0 ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No web links added yet. Paste YouTube/GateOverflow links above.
                      </span>
                    ) : (
                      modalLinks.map((link) => (
                        <div key={link.id} className="dialog-link-item">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            🔗 {link.title || link.url}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveModalLink(link.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingDayId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveNotes}
                >
                  Save to MongoDB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: LOG MISTAKE TO NOTEBOOK                               */}
      {/* ============================================================== */}
      {isMistakeModalOpen && (
        <div className="app-dialog-backdrop">
          <div className="app-dialog">
            <div className="dialog-content glass-card">
              <div className="dialog-header">
                <div>
                  <span className="dialog-sub">GATE DA Error Notebook</span>
                  <h3 className="dialog-title">Log Question Mistake to MongoDB</h3>
                </div>
                <button
                  className="dialog-close-btn"
                  onClick={() => setIsMistakeModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleMistakeSubmit} className="dialog-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Question Identifier *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GATE DA 2024 Q18 or Mock #1 Q12"
                      value={mistakeForm.question}
                      onChange={(e) => setMistakeForm({ ...mistakeForm, question: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={mistakeForm.date}
                      onChange={(e) => setMistakeForm({ ...mistakeForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Topic / Sub-topic *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SVD, Bayes Theorem, Rank-Nullity"
                      value={mistakeForm.topic}
                      onChange={(e) => setMistakeForm({ ...mistakeForm, topic: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select
                      value={mistakeForm.subject}
                      onChange={(e) => setMistakeForm({ ...mistakeForm, subject: e.target.value })}
                    >
                      <option value="Probability & Statistics">Probability & Statistics</option>
                      <option value="Linear Algebra">Linear Algebra</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="DBMS & Warehousing">DBMS & Warehousing</option>
                      <option value="Calculus & Optimization">Calculus & Optimization</option>
                      <option value="Programming & DSA">Programming & DSA</option>
                      <option value="General Aptitude">General Aptitude</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Error Category *</label>
                  <select
                    value={mistakeForm.errorType}
                    onChange={(e) => setMistakeForm({ ...mistakeForm, errorType: e.target.value })}
                  >
                    <option value="Forgot Bayes">Forgot Bayes / Formula Slip</option>
                    <option value="Calculation">Calculation / Algebra Mistake</option>
                    <option value="Didn't know concept">Didn't Know Concept (Theoretical Gap)</option>
                    <option value="Too slow">Too Slow / Time Management</option>
                    <option value="Misread question">Misread Question / Trap NOT/INCORRECT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Mistake</label>
                  <textarea
                    rows={2}
                    placeholder="Why did the mistake occur? What assumption was wrong?"
                    value={mistakeForm.reason}
                    onChange={(e) => setMistakeForm({ ...mistakeForm, reason: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Action / Correction Taken</label>
                  <textarea
                    rows={2}
                    placeholder="What rule or derivation did you revise to ensure it never happens again?"
                    value={mistakeForm.actionTaken}
                    onChange={(e) => setMistakeForm({ ...mistakeForm, actionTaken: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Question Link / Web Reference (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://gateoverflow.in/..."
                    value={mistakeForm.referenceUrl}
                    onChange={(e) => setMistakeForm({ ...mistakeForm, referenceUrl: e.target.value })}
                  />
                </div>

                <div className="dialog-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsMistakeModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save to Mistake Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RECORD MOCK SCORE                                     */}
      {/* ============================================================== */}
      {isMockModalOpen && (
        <div className="app-dialog-backdrop">
          <div className="app-dialog">
            <div className="dialog-content glass-card">
              <div className="dialog-header">
                <div>
                  <span className="dialog-sub">Score Progression</span>
                  <h3 className="dialog-title">Record Checkpoint / Mock Result</h3>
                </div>
                <button
                  className="dialog-close-btn"
                  onClick={() => setIsMockModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleMockScoreSubmit} className="dialog-body">
                <div className="form-group">
                  <label className="form-label">Milestone Checkpoint</label>
                  <select
                    value={mockForm.checkpointId}
                    onChange={(e) => setMockForm({ ...mockForm, checkpointId: e.target.value })}
                  >
                    <option value="Oct 4 Diagnostic">Oct 4 — Math Diagnostic Test</option>
                    <option value="Oct 10 Foundations">Oct 10 — Foundations Checkpoint</option>
                    <option value="Oct 31 Checkpoint">Oct 31 — October Checkpoint (Target 15–20)</option>
                    <option value="Nov 30 Checkpoint">Nov 30 — Full 3-Hour DA Checkpoint (Target 20–30)</option>
                    <option value="Dec 31 Checkpoint">Dec 31 — Full 3-Hour Checkpoint (Target 30–35)</option>
                    <option value="Jan 15 Checkpoint">Jan 15 — ML Mid-Checkpoint (Target 35–40)</option>
                    <option value="Jan 30 Mock 1">Jan 30 — Full Mock #1 (Target 40–45)</option>
                    <option value="Feb 1 Mock 2">Feb 1 — Full Mock #2 (Target 35+)</option>
                    <option value="Feb 3 Mock 3">Feb 3 — Full Mock #3 (Target 40+)</option>
                    <option value="Custom Test">Custom Practice Test</option>
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Actual Score / Marks *</label>
                    <input
                      type="number"
                      step="0.33"
                      required
                      placeholder="e.g. 32.66"
                      value={mockForm.score}
                      onChange={(e) =>
                        setMockForm({
                          ...mockForm,
                          score: e.target.value === '' ? '' : parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Score</label>
                    <input
                      type="text"
                      placeholder="e.g. 30–35"
                      value={mockForm.targetScore}
                      onChange={(e) => setMockForm({ ...mockForm, targetScore: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Analysis & Weaknesses Discovered</label>
                  <textarea
                    rows={3}
                    placeholder="Key takeaways: which section lost most marks? Speed vs accuracy?"
                    value={mockForm.notes}
                    onChange={(e) => setMockForm({ ...mockForm, notes: e.target.value })}
                  />
                </div>

                <div className="dialog-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsMockModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Result to MongoDB
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating "Today's Task" Pill */}
      {showScrollToTopFab && activeTab === 'tab-schedule' && (
        <button
          className="fab-back-to-today"
          onClick={handleScrollToToday}
          title="Back to Today's Task Spotlight at Top"
        >
          <span className="fab-pulse-dot"></span>
          <span>⚡ Today&apos;s Task</span>
        </button>
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
