import { useCallback, useEffect, useState } from "react";
import type { ProgressState } from "../types";

const KEY = "uc1-learn-progress-v1";

const defaultState = (firstId: string): ProgressState => ({
  activeId: firstId,
  completed: {},
  quizAnswers: {},
  quizSubmitted: {},
  capstoneAnswers: {},
  capstoneSubmitted: false,
  capstoneDone: false,
});

export function useProgress(firstId: string) {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...defaultState(firstId), ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return defaultState(firstId);
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setActive = useCallback((id: string) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const markComplete = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      completed: { ...s.completed, [id]: true },
    }));
  }, []);

  const setQuizAnswer = useCallback(
    (moduleId: string, qid: string, value: string) => {
      setState((s) => ({
        ...s,
        quizSubmitted: { ...s.quizSubmitted, [moduleId]: false },
        quizAnswers: {
          ...s.quizAnswers,
          [moduleId]: { ...(s.quizAnswers[moduleId] ?? {}), [qid]: value },
        },
      }));
    },
    []
  );

  const submitQuiz = useCallback((moduleId: string) => {
    setState((s) => ({
      ...s,
      quizSubmitted: { ...s.quizSubmitted, [moduleId]: true },
    }));
  }, []);

  const setCapstoneAnswer = useCallback((qid: string, value: string) => {
    setState((s) => ({
      ...s,
      capstoneSubmitted: false,
      capstoneAnswers: { ...s.capstoneAnswers, [qid]: value },
    }));
  }, []);

  const submitCapstone = useCallback((passed: boolean) => {
    setState((s) => ({
      ...s,
      capstoneSubmitted: true,
      capstoneDone: passed || s.capstoneDone,
      completed: passed
        ? { ...s.completed, capstone: true }
        : s.completed,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const next = defaultState(firstId);
    setState(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, [firstId]);

  return {
    state,
    setActive,
    markComplete,
    setQuizAnswer,
    submitQuiz,
    setCapstoneAnswer,
    submitCapstone,
    resetProgress,
  };
}
