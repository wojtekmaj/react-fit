import React, { PureComponent } from 'react';
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
        >
          Popover
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
