import { useState } from 'react';

const IconToolbar = ({
  side = 'left',
  tools = [],
  activeTool,
  isOpen,
  onToolClick,
}) => {
  const [hoveredTool, setHoveredTool] = useState(null);

  return (
    <div className={`lazy-editor-toolbar lazy-editor-toolbar--${side}`}>
      {tools.map((tool) => {
        const isActive = isOpen && activeTool === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            className={`lazy-editor-toolbar__button${
              isActive ? ' is-active' : ''
            }`}
            onClick={() => onToolClick(tool.id)}
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
            onFocus={() => setHoveredTool(tool.id)}
            onBlur={() => setHoveredTool(null)}
            aria-pressed={isActive}
            aria-label={tool.label}
          >
            <span className="lazy-editor-toolbar__icon">{tool.icon}</span>
            {hoveredTool === tool.id ? (
              <span
                className={`lazy-editor-toolbar__tooltip lazy-editor-toolbar__tooltip--${side}`}
              >
                {tool.label}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default IconToolbar;
