import { useEffect, useMemo, useRef, useState } from "react";
import curriculum from "./data/curriculum.json";
import type { Curriculum, ModuleDef, QuizItem } from "./types";
import { useProgress } from "./hooks/useProgress";
import { ModuleIllustration } from "./components/Illustrations";
import "./App.css";

const data = curriculum as Curriculum;
const ALL_IDS = [...data.modules.map((m) => m.id), "capstone"];

function QuizBlock({
  items,
  answers,
  submitted,
  onAnswer,
  onSubmit,
}: {
  items: QuizItem[];
  answers: Record<string, string>;
  submitted: boolean;
  onAnswer: (qid: string, v: string) => void;
  onSubmit: () => void;
}) {
  const score = items.reduce(
    (n, q) => n + (answers[q.id] === q.correct ? 1 : 0),
    0
  );
  return (
    <section className="quiz">
      <h3>Cek pemahaman</h3>
      {items.map((q) => {
        const ok = answers[q.id] === q.correct;
        const keyLabel =
          q.options.find((o) => o.value === q.correct)?.label ?? q.correct;
        return (
          <div key={q.id} className="quiz-item">
            <p className="quiz-q">{q.q}</p>
            <select
              value={answers[q.id] ?? ""}
              onChange={(e) => onAnswer(q.id, e.target.value)}
            >
              <option value="">Pilih jawaban…</option>
              {q.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {submitted && (
              <p className={ok ? "ok" : "bad"}>
                {ok ? "Benar" : `Kurang tepat — kunci: ${keyLabel}`}
              </p>
            )}
          </div>
        );
      })}
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit}>
          Periksa jawaban
        </button>
        {submitted && (
          <span className="pill">
            Skor {score}/{items.length}
          </span>
        )}
      </div>
    </section>
  );
}

function ModulePane({
  mod,
  completed,
  answers,
  submitted,
  onComplete,
  onAnswer,
  onSubmitQuiz,
}: {
  mod: ModuleDef;
  completed: boolean;
  answers: Record<string, string>;
  submitted: boolean;
  onComplete: () => void;
  onAnswer: (qid: string, v: string) => void;
  onSubmitQuiz: () => void;
}) {
  return (
    <article className="pane">
      <div className="row wrap">
        <span className={`pill ${mod.track === "fundamentals" ? "info" : ""}`}>
          {mod.track === "fundamentals" ? "Fundamental DL" : "Proyek UC1"}
        </span>
      </div>
      <h2>{mod.title}</h2>
      <div className="callout info">
        <strong>Tujuan belajar</strong>
        <p>{mod.goal}</p>
      </div>
      <ModuleIllustration id={mod.id} />
      {mod.sections.map((s) => (
        <details key={s.heading} className="section" open>
          <summary>{s.heading}</summary>
          <div className="section-body">
            {s.body.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </details>
      ))}
      <QuizBlock
        items={mod.quiz}
        answers={answers}
        submitted={submitted}
        onAnswer={onAnswer}
        onSubmit={onSubmitQuiz}
      />
      <label className="complete">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => {
            if (e.target.checked) onComplete();
          }}
        />
        Tandai modul selesai
      </label>
    </article>
  );
}

function CapstonePane({
  answers,
  submitted,
  done,
  onAnswer,
  onSubmit,
}: {
  answers: Record<string, string>;
  submitted: boolean;
  done: boolean;
  onAnswer: (qid: string, v: string) => void;
  onSubmit: (passed: boolean) => void;
}) {
  const passAt = 8;
  const score = data.capstone.reduce(
    (n, q) => n + (answers[q.id] === q.correct ? 1 : 0),
    0
  );
  return (
    <article className="pane">
      <h2>Capstone — Fundamental + UC1</h2>
      <div className="callout warn">
        <strong>12 soal campuran</strong>
        <p>
          Ambang lulus {passAt}/12. Jangan klaim skor model final yang belum ada
          di Issue 3.0.
        </p>
      </div>
      {data.capstone.map((q, idx) => {
        const ok = answers[q.id] === q.correct;
        return (
          <div key={q.id} className="card">
            <h4>Soal {idx + 1}</h4>
            <p className="quiz-q">{q.q}</p>
            <select
              value={answers[q.id] ?? ""}
              onChange={(e) => onAnswer(q.id, e.target.value)}
            >
              <option value="">Pilih jawaban…</option>
              {q.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {submitted && (
              <p className={ok ? "ok" : "bad"}>
                {ok ? "Benar" : "Kurang tepat"}
              </p>
            )}
          </div>
        );
      })}
      <div className="row">
        <button
          type="button"
          className="btn primary"
          onClick={() => onSubmit(score >= passAt)}
        >
          Kirim capstone
        </button>
        {submitted && (
          <span className="pill">
            Skor {score}/12
          </span>
        )}
        {done && <span className="pill ok-pill">Capstone selesai</span>}
      </div>
    </article>
  );
}

function useIsNarrow(breakpoint = 860) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);
  return narrow;
}

export default function App() {
  const firstId = data.modules[0]?.id ?? "f01";
  const {
    state,
    setActive,
    markComplete,
    setQuizAnswer,
    submitQuiz,
    setCapstoneAnswer,
    submitCapstone,
    resetProgress,
  } = useProgress(firstId);
  const isNarrow = useIsNarrow();
  const [tocOpen, setTocOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const goTo = (id: string) => {
    setActive(id);
    if (isNarrow) {
      setTocOpen(false);
      requestAnimationFrame(() => {
        mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const activeModule = useMemo(
    () => data.modules.find((m) => m.id === state.activeId),
    [state.activeId]
  );

  const doneN = ALL_IDS.filter((id) =>
    id === "capstone" ? state.capstoneDone || state.completed.capstone : state.completed[id]
  ).length;
  const fundDone = data.modules.filter(
    (m) => m.track === "fundamentals" && state.completed[m.id]
  ).length;
  const uc1Done = data.modules.filter(
    (m) => m.track === "uc1" && state.completed[m.id]
  ).length;

  const idx = ALL_IDS.indexOf(state.activeId);
  const showToc = !isNarrow || tocOpen;

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">BMKG · MMS-2 P3 · Big Data &amp; AI</p>
        <h1>{data.title}</h1>
        <p className="sub">{data.subtitle}</p>
        <p className="cutoff">Cut-off: {data.cutoff}</p>
        <div className="stats">
          <div className="stat">
            <strong>
              {doneN}/{ALL_IDS.length}
            </strong>
            <span>Selesai</span>
          </div>
          <div className="stat">
            <strong>{fundDone}/10</strong>
            <span>Fundamental</span>
          </div>
          <div className="stat">
            <strong>{uc1Done}/12</strong>
            <span>UC1</span>
          </div>
        </div>
        <div className="progress-bar" aria-hidden>
          <div
            className="progress-fill"
            style={{ width: `${(doneN / ALL_IDS.length) * 100}%` }}
          />
        </div>
        <div className="row wrap">
          <button type="button" className="btn ghost" onClick={resetProgress}>
            Reset progres
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setTocOpen(true);
              document.getElementById("silabus")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Loncat ke silabus
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar" id="silabus">
          <div className="sidebar-head">
            <div>
              <h3>Silabus</h3>
              <p className="hint">F1–F10 dulu jika baru kenal deep learning.</p>
            </div>
            {isNarrow && (
              <button
                type="button"
                className="btn toc-toggle"
                aria-expanded={tocOpen}
                onClick={() => setTocOpen((v) => !v)}
              >
                {tocOpen ? "Tutup" : "Buka daftar"}
              </button>
            )}
          </div>
          {showToc && (
            <ol className="toc">
              {data.modules.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={
                      state.activeId === m.id
                        ? "toc-btn active"
                        : "toc-btn"
                    }
                    onClick={() => goTo(m.id)}
                  >
                    <span
                      className={
                        state.completed[m.id] ? "dot done" : "dot"
                      }
                    />
                    {m.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={
                    state.activeId === "capstone" ? "toc-btn active" : "toc-btn"
                  }
                  onClick={() => goTo("capstone")}
                >
                  <span
                    className={
                      state.capstoneDone || state.completed.capstone
                        ? "dot done"
                        : "dot"
                    }
                  />
                  Capstone — Fundamental + UC1
                </button>
              </li>
            </ol>
          )}
        </aside>

        <main ref={mainRef} id="konten">
          <div className="nav-row">
            <button
              type="button"
              className="btn"
              disabled={idx <= 0}
              onClick={() => goTo(ALL_IDS[idx - 1])}
            >
              Sebelumnya
            </button>
            <select
              className="jump"
              value={state.activeId}
              onChange={(e) => goTo(e.target.value)}
            >
              {ALL_IDS.map((id) => (
                <option key={id} value={id}>
                  {id === "capstone"
                    ? "Capstone"
                    : data.modules.find((m) => m.id === id)?.title ?? id}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              disabled={idx >= ALL_IDS.length - 1}
              onClick={() => goTo(ALL_IDS[idx + 1])}
            >
              Berikutnya
            </button>
          </div>

          {state.activeId === "capstone" ? (
            <CapstonePane
              answers={state.capstoneAnswers}
              submitted={state.capstoneSubmitted}
              done={state.capstoneDone}
              onAnswer={setCapstoneAnswer}
              onSubmit={submitCapstone}
            />
          ) : activeModule ? (
            <ModulePane
              mod={activeModule}
              completed={!!state.completed[activeModule.id]}
              answers={state.quizAnswers[activeModule.id] ?? {}}
              submitted={!!state.quizSubmitted[activeModule.id]}
              onComplete={() => markComplete(activeModule.id)}
              onAnswer={(qid, v) =>
                setQuizAnswer(activeModule.id, qid, v)
              }
              onSubmitQuiz={() => submitQuiz(activeModule.id)}
            />
          ) : null}

          {state.activeId === "u12" && (
            <div className="callout">
              <strong>AI Tutor (opsional, butuh Cursor API key)</strong>
              <pre className="code">
                cd learn-uc1-tutor && npm install && npm run tutor
              </pre>
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        Sumber: UC1 Draft Report Issue 3.0 · FT Prep M2P3-0394 · Progress Q4
        2025 · Mission slides. Static build untuk GitHub Pages.
      </footer>
    </div>
  );
}
