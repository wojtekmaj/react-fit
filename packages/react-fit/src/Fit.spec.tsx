import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import Fit from './Fit.js';

describe('<Fit /> component', () => {
  it('renders properly', async () => {
    const { container } = await render(
      <Fit>
        <span />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given mainAxis = "x"', async () => {
    const { container } = await render(
      <Fit mainAxis="x">
        <span />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given mainAxis = "y"', async () => {
    const { container } = await render(
      <Fit mainAxis="y">
        <span />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given React component as child', async () => {
    function Child() {
      return <span />;
    }

    const { container } = await render(
      <Fit>
        <Child />
      </Fit>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders properly given element with ref prop as child', async () => {
    const { container } = await render(
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
