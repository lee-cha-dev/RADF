import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import VizRenderer from '../../core/viz/VizRenderer.jsx';

describe('VizRenderer', () => {
  it('renders a missing viz fallback when unregistered', () => {
    const { getByText } = render(
      <VizRenderer
        panelConfig={{ id: 'panel-1' }}
        vizType="missing-viz"
        data={[]}
        encodings={{}}
        options={{}}
      />
    );

    expect(getByText('Visualization unavailable')).toBeInTheDocument();
  });
});
