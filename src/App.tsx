import React, { useState, useEffect } from 'react';
import { ThemisMainWindow } from './views/ThemisMainWindow';
import { Contest } from './types';
import { storage } from './storage';

export const App: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeContestId, setActiveContestId] = useState<string>('');

  // Start completely clean - NO hardcoded sample data
  useEffect(() => {
    const init = async () => {
      const list = await storage.getContests();
      setContests(list);
      if (list.length > 0) {
        setActiveContestId(list[0].id);
      }
    };
    init();
  }, []);

  const handleUpdateContest = async (updated: Contest) => {
    await storage.saveContest(updated);
    setContests((prev) => {
      const idx = prev.findIndex((c) => c.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
    if (!activeContestId) {
      setActiveContestId(updated.id);
    }
  };

  const handleDeleteContest = async (id: string) => {
    await storage.deleteContest(id);
    const updated = contests.filter((c) => c.id !== id);
    setContests(updated);
    if (updated.length > 0) {
      setActiveContestId(updated[0].id);
    } else {
      setActiveContestId('');
    }
  };

  const handleNewContest = async () => {
    const title = prompt('Nhập tên kỳ thi mới (VD: KỲ THI CHỌN HỌC SINH GIỎI 2026):');
    if (!title || !title.trim()) return;

    const newContest: Contest = {
      id: `contest-${Date.now()}`,
      title: title.trim(),
      createdAt: Date.now(),
      problems: [],
    };

    await storage.saveContest(newContest);
    setContests((prev) => [...prev, newContest]);
    setActiveContestId(newContest.id);
  };

  return (
    <ThemisMainWindow
      contests={contests}
      activeContestId={activeContestId}
      onSelectContest={setActiveContestId}
      onUpdateContest={handleUpdateContest}
      onDeleteContest={handleDeleteContest}
      onNewContest={handleNewContest}
    />
  );
};

export default App;
