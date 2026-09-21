import lessons from "../data/lessons";
import "./Lessons.css";

export default function Lessons() {
  return (
    <div className="learn-page">
      <h1>Learn the Basics</h1>
      <p className="learn-subtitle">
        New to stocks? Start here before you trade.
      </p>

      {lessons.map((lesson, index) => (
        <div key={lesson.title} className="lesson-block">
          <div className="lesson-heading">
            <span className="lesson-number">{index + 1}</span>
            <h2>
              {lesson.emoji} {lesson.title}
            </h2>
          </div>
          {lesson.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
}