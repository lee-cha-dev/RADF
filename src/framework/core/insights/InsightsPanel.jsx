/**
 * @module core/insights/InsightsPanel
 * @description Presentational component for rendering insight cards.
 */

import React from 'react';

/**
 * @typedef {import('../docs/jsdocTypes.js').Insight} Insight
 */

/**
 * Render the evidence list for an insight card.
 * @param {string[]} evidence - Evidence strings.
 * @returns {React.ReactNode|null} Evidence list markup.
 */
const renderEvidence = (evidence = []) => {
  if (!evidence.length) {
    return null;
  }
  return (
    <ul className="radf-insight-card__evidence">
      {evidence.map((item, index) => (
        <li key={`${item}-${index}`} className="radf-insight-card__evidence-item">
          {item}
        </li>
      ))}
    </ul>
  );
};

/**
 * @typedef {Object} InsightsPanelProps
 * @property {Insight[]} [insights] - Insights to display.
 */

/**
 * Render insight cards in a stacked layout.
 * @param {InsightsPanelProps} props - Component props.
 * @returns {JSX.Element} Insight list UI.
 */
function InsightsPanel({ insights = [] }) {
  return (
    <div className="radf-insights">
      {insights.map((insight) => (
        <article
          key={insight.id}
          className={`radf-insight-card radf-insight-card--${insight.severity || 'info'}`}
        >
          <header className="radf-insight-card__header">
            <div>
              <h3 className="radf-insight-card__title">{insight.title}</h3>
              {insight.source ? (
                <p className="radf-insight-card__source">Source: {insight.source}</p>
              ) : null}
            </div>
            {insight.severity ? (
              <span className="radf-insight-card__badge">{insight.severity}</span>
            ) : null}
          </header>
          {insight.narrative ? (
            <p className="radf-insight-card__narrative">{insight.narrative}</p>
          ) : null}
          {renderEvidence(insight.evidence)}
          {insight.recommendedAction ? (
            <p className="radf-insight-card__action">
              <strong>Recommended:</strong> {insight.recommendedAction}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default InsightsPanel;
