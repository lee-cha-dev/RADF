import React from 'react';
import { vizRegistry } from '../registry/registry';

function VizRenderer({ vizType, data, encodings, options, handlers }) {
  const Component = vizRegistry.get(vizType);

  if (!Component) {
    return (
      <div className="radf-viz__missing">
        <p className="radf-viz__missing-title">Visualization unavailable</p>
        <p className="radf-viz__missing-text">
          The viz type "{vizType}" has not been registered yet.
        </p>
      </div>
    );
  }

  return (
    <Component
      data={data}
      encodings={encodings}
      options={options}
      handlers={handlers}
    />
  );
}

export default VizRenderer;
