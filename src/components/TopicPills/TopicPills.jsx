import React from 'react';
import "./TopicPills.scss"

const TopicPills = ({ topics, value, onChange }) => {
  return (
    <div className="topic-pills">
      {topics.map((t) => (
        <button
          key={t.id}
          className={`pill ${value === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default TopicPills;
