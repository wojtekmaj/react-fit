import { describe, expect, it } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

import Fit from './Fit';

describe('<Fit /> component', () => {
  it('renders properly', () => {
    const { container } = render(
      <Fit>
        <span />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given mainAxis = "x"', () => {
    const { container } = render(
      <Fit mainAxis="x">
        <span />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given mainAxis = "y"', () => {
    const { container } = render(
      <Fit mainAxis="y">
        <span />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });
});
