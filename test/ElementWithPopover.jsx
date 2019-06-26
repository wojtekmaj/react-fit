import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';

import Fit from '../src/Fit';

import './Test.less';

export default class ElementWithPopover extends PureComponent {
  state = {
    isOpen: null,
  }

  togglePopover = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  renderLabel() {
    const { label } = this.props;

    return (
      <button
        onClick={this.togglePopover}
        type="button"
      >
        {label}
      </button>
    );
  }

  renderPopover() {
    const { label, ...otherProps } = this.props;
    const { isOpen } = this.state;

    if (isOpen === null) {
      return null;
    }

    return (
      <Fit
        spacing={10}
        {...otherProps}
      >
        <div
          className={mergeClassNames(
            'ElementWithPopover__popover',
            isOpen && 'ElementWithPopover__popover--isOpen',
          )}
          ref={(ref) => {
            if (!ref) {
              return;
            }

            requestAnimationFrame(() => {
              const style = {};
              if (ref.style.top) { style.top = ref.style.top; }
              if (ref.style.bottom) { style.bottom = ref.style.bottom; }
              if (ref.style.left) { style.left = ref.style.left; }
              if (ref.style.right) { style.right = ref.style.right; }

              const el = ref.querySelector('pre[name="style"]');
              el.innerHTML = JSON.stringify(style, null, '  ');
            });
          }}
        >
          <pre name="props">
            {JSON.stringify(otherProps, null, '  ')}
          </pre>
          <pre name="style" />
        </div>
      </Fit>
    );
  }

  render() {
    return (
      <div className="ElementWithPopover">
        {this.renderLabel()}
        {this.renderPopover()}
      </div>
    );
  }
}

ElementWithPopover.propTypes = {
  label: PropTypes.node,
};
