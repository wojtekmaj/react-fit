import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import Fit from './Fit.js';

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

  it('renders properly given React component as child', () => {
    function Child() {
      return <span />;
    }

    const { container } = render(
      <Fit>
        <Child />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given element with ref prop as child', () => {
    const { container } = render(
      <Fit>
        <span
          ref={() => {
            // Intentionally empty
          }}
        />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });
});
