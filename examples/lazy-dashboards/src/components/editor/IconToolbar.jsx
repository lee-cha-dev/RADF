import { useState } from 'react';

/**
 * @typedef {Object} ToolbarItem
 * @property {string} id
 * @property {string} label
 * @property {React.ReactNode} icon
 */

/**
 * @typedef {Object} IconToolbarProps
 * @property {'left'|'right'} [side]
 * @property {ToolbarItem[]} [tools]
 * @property {string} [activeTool]
 * @property {boolean} isOpen
 * @property {(toolId: string) => void} onToolClick
 */

/**
 * Icon-only toolbar used to toggle editor side panels.
 *
 * @param {IconToolbarProps} props
 * @returns {JSX.Element}
 */
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
