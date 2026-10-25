import { useEffect, useMemo, useRef, useState } from "react";
import lessons, { LEVELS } from "../data/lessons";
import "./Lessons.css";
import WhatIf from "../components/WhatIf";

const STORAGE_KEY = "papertrader-learn-v1";

const SECTION_LABELS = {
  example: "Example",
  tip: "Remember",
  warn: "Watch out",
  formula: "Formula",
  app: "On PaperTrader",
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { done: saved?.done || {}, answers: saved?.answers || {} };
  } catch {
    return { done: {}, answers: {} };
  }
}

function Section({ section }) {
  if (section.t === "p") return <p className="ls-text">{section.x}</p>;
  if (section.t === "formula") {
    return (
      <div className="ls-callout ls-formula">
        <span className="ls-callout-label">{SECTION_LABELS.formula}</span>
        <code>{section.x}</code>
      </div>
    );
  }
  return (
    <div className={`ls-callout ls-${section.t}`}>
      <span className="ls-callout-label">{SECTION_LABELS[section.t]}</span>
      <p>{section.x}</p>
    </div>
  );
}

function Quiz({ lesson, picked, onPick, onReset }) {
  const { quiz } = lesson;
  const answered = picked !== undefined;
  const correct = picked === quiz.answer;

  return (
    <div className="ls-quiz">
      <h3>Quick check</h3>
      <p className="ls-quiz-q">{quiz.q}</p>
      <div className="ls-options">
        {quiz.options.map((option, i) => {
          let state = "";
          if (answered && i === quiz.answer) state = "is-correct";
          else if (answered && i === picked) state = "is-wrong";
          return (
            <button
              key={option}
              type="button"
              className={`ls-option ${state}`}
              disabled={answered}
              onClick={() => onPick(i)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`ls-result ${correct ? "is-correct" : "is-wrong"}`} role="status">
          <strong>{correct ? "Correct." : "Not quite."}</strong> {quiz.why}
          {!correct && (
            <button type="button" className="ls-link" onClick={onReset}>
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Lessons() {
  const [level, setLevel] = useState("beginner");
  const [activeId, setActiveId] = useState(lessons[0].id);
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState(loadProgress);
  const contentRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable, progress just won't persist */
    }
  }, [progress]);

  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const active = lessons[activeIndex];

  const levelStats = useMemo(
    () =>
      LEVELS.map((lv) => {
        const items = lessons.filter((l) => l.level === lv.id);
        const done = items.filter((l) => progress.done[l.id]).length;
        return { ...lv, total: items.length, done };
      }),
    [progress.done]
  );

  const totalDone = levelStats.reduce((sum, lv) => sum + lv.done, 0);
  const percent = Math.round((totalDone / lessons.length) * 100);
  const minutesLeft = lessons
    .filter((l) => !progress.done[l.id])
    .reduce((sum, l) => sum + l.minutes, 0);

  const search = query.trim().toLowerCase();
  const visible = lessons.filter((l) => {
    if (search) return `${l.title} ${l.summary}`.toLowerCase().includes(search);
    return l.level === level;
  });

  function openLesson(id) {
    const next = lessons.find((l) => l.id === id);
    setActiveId(id);
    setLevel(next.level);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseLevel(id) {
    setQuery("");
    setLevel(id);
    const first = lessons.find((l) => l.level === id);
    if (first) setActiveId(first.id);
  }

  function toggleDone(id) {
    setProgress((p) => ({ ...p, done: { ...p.done, [id]: !p.done[id] } }));
  }

  function pickAnswer(id, i) {
    setProgress((p) => ({
      done: { ...p.done, [id]: true },
      answers: { ...p.answers, [id]: i },
    }));
  }

  function resetAnswer(id) {
    setProgress((p) => {
      const answers = { ...p.answers };
      delete answers[id];
      return { ...p, answers };
    });
  }

  const prev = lessons[activeIndex - 1];
  const next = lessons[activeIndex + 1];
  const activeLevel = LEVELS.find((lv) => lv.id === active.level);

  return (
    <div className="learn-page">
      <header className="ls-hero">
        <div className="ls-hero-text">
          <h1>Learn to trade</h1>
          <p className="learn-subtitle">
            {lessons.length} short lessons that take you from your first stock to managing
            portfolio risk. Every lesson ends with a quick check.
          </p>
        </div>
        <div className="ls-progress-card">
          <div className="ls-progress-top">
            <span className="ls-progress-value">{percent}%</span>
            <span className="ls-progress-meta">
              {totalDone} of {lessons.length} lessons
              <br />
              {minutesLeft > 0 ? `about ${minutesLeft} min left` : "Course complete"}
            </span>
          </div>
          <div
            className="ls-bar"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Course progress"
          >
            <div className="ls-bar-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      <div className="ls-levels" role="tablist" aria-label="Difficulty level">
        {levelStats.map((lv) => (
          <button
            key={lv.id}
            type="button"
            role="tab"
            aria-selected={!search && level === lv.id}
            className={`ls-level ${!search && level === lv.id ? "is-active" : ""}`}
            onClick={() => chooseLevel(lv.id)}
          >
            <span className="ls-level-name">{lv.label}</span>
            <span className="ls-level-count">
              {lv.done}/{lv.total}
            </span>
          </button>
        ))}
      </div>

      <div className="ls-layout">
        <aside className="ls-sidebar">
          <input
            type="search"
            className="ls-search"
            placeholder="Search lessons"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search lessons"
          />
          {!search && <p className="ls-blurb">{LEVELS.find((lv) => lv.id === level).blurb}</p>}
          <ul className="ls-list">
            {visible.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={`ls-item ${l.id === activeId ? "is-active" : ""}`}
                  onClick={() => openLesson(l.id)}
                >
                  <span className={`ls-check ${progress.done[l.id] ? "is-done" : ""}`} aria-hidden="true">
                    {progress.done[l.id] ? "✓" : ""}
                  </span>
                  <span className="ls-item-title">
                    {l.emoji} {l.title}
                  </span>
                  <span className="ls-item-time">{l.minutes} min</span>
                </button>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="ls-empty">No lessons match "{query}". Try a word like "price" or "risk".</li>
            )}
          </ul>
        </aside>

        <main className="ls-content" ref={contentRef} key={active.id}>
          <div className="ls-meta">
            <span className={`ls-badge ls-badge-${active.level}`}>{activeLevel.label}</span>
            <span>{active.minutes} min read</span>
            <span>
              Lesson {activeIndex + 1} of {lessons.length}
            </span>
          </div>
          <h2 className="ls-title">
            <span aria-hidden="true">{active.emoji}</span> {active.title}
          </h2>
          <p className="ls-summary">{active.summary}</p>

          {active.sections.map((s, i) => (
            <Section key={i} section={s} />
          ))}
          
          {active.id === "price-change" && (
          <WhatIf id="price-change" />
          )}
          {active.id === "market-cap" && (
          <WhatIf id="market-cap" />
          )}
          {active.id === "pe-eps" && (
          <WhatIf id="pe-eps" />
          )}
         {active.id === "position-sizing" && (
          <WhatIf id="position-sizing" />
        )}
        {active.id === "beta-volatility" && (
        <WhatIf id="beta" />
        )}

          <Quiz
            lesson={active}
            picked={progress.answers[active.id]}
            onPick={(i) => pickAnswer(active.id, i)}
            onReset={() => resetAnswer(active.id)}
          />

          <div className="ls-footer">
            <button type="button" className="ls-btn ls-btn-ghost" disabled={!prev} onClick={() => prev && openLesson(prev.id)}>
              ← Previous
            </button>
            <button
              type="button"
              className={`ls-btn ${progress.done[active.id] ? "ls-btn-done" : "ls-btn-primary"}`}
              onClick={() => toggleDone(active.id)}
            >
              {progress.done[active.id] ? "Completed ✓" : "Mark as complete"}
            </button>
            <button type="button" className="ls-btn ls-btn-ghost" disabled={!next} onClick={() => next && openLesson(next.id)}>
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}