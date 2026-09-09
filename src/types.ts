export type ModuleId = string;

export type QuizItem = {
  id: string;
  q: string;
  options: Array<{ value: string; label: string }>;
  correct: string;
  /** Optional explanation shown after submit (Study Guide). */
  explain?: string;
};

export type ModuleDef = {
  id: ModuleId;
  track: "fundamentals" | "uc1";
  title: string;
  goal: string;
  sections: Array<{ heading: string; body: string[] }>;
  quiz: QuizItem[];
};

export type Curriculum = {
  title: string;
  subtitle: string;
  cutoff: string;
  modules: ModuleDef[];
  capstone: QuizItem[];
};

export type ProgressState = {
  activeId: string;
  completed: Record<string, boolean>;
  quizAnswers: Record<string, Record<string, string>>;
  quizSubmitted: Record<string, boolean>;
  capstoneAnswers: Record<string, string>;
  capstoneSubmitted: boolean;
  capstoneDone: boolean;
};
