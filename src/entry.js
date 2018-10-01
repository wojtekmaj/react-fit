import React, { Component } from 'react';
import PropTypes from 'prop-types';
import detectElementOverflow from 'detect-element-overflow';

import { warnOnDev } from './shared/utils';

const upperCaseFirstLetter = a => a.slice(0, 1).toUpperCase() + a.slice(1, a.length);

const alignAxis = ({
  axis,
  element,
  invertAxis,
  secondary,
  spacing,
}) => {
  const style = window.getComputedStyle(element);

  const parent = element.parentElement;
  const parentCollisions = detectElementOverflow(parent, document.body);

  const isX = axis === 'x';
  const displayStartProperty = isX ? 'left' : 'top';
  const displayEndProperty = isX ? 'right' : 'bottom';
  const sizeProperty = isX ? 'width' : 'height';
  const overflowStartProperty = `overflow${upperCaseFirstLetter(displayStartProperty)}`;
  const overflowEndProperty = `overflow${upperCaseFirstLetter(displayEndProperty)}`;
  const initialSizeProperty = `client${upperCaseFirstLetter(sizeProperty)}`;
  const minSizeProperty = `min-${sizeProperty}`;

  let availableStartSpace = -parentCollisions[overflowStartProperty] - spacing;
  let availableEndSpace = -parentCollisions[overflowEndProperty] - spacing;

  if (secondary) {
    availableStartSpace += parent[initialSizeProperty];
    availableEndSpace += parent[initialSizeProperty];
  }

  const initialSize = element[initialSizeProperty];

  const willFitStart = (size = initialSize) => size <= availableStartSpace;
  const willFitEnd = (size = initialSize) => size <= availableEndSpace;

  const displayStart = () => {
    element.style[displayEndProperty] = secondary ? '0' : '100%';
  };

  const displayEnd = () => {
    element.style[displayStartProperty] = secondary ? '0' : '100%';
  };

  const displayIfFits = (size = initialSize, willFit, display) => {
    if (willFit(size)) {
      display();
      return true;
    }
    return false;
  };

  const displayStartIfFits = (size = initialSize) => (
    displayIfFits(size, willFitStart, displayStart)
  );

  const displayEndIfFits = (size = initialSize) => (
    displayIfFits(size, willFitEnd, displayEnd)
  );

  const displayWhereverShrinkedFits = () => {
    const moreSpaceStart = availableStartSpace > availableEndSpace;
    const minSize = style[minSizeProperty] && parseInt(style[minSizeProperty], 10);

    const shrinkToSize = (newSize) => {
      warnOnDev(`<Fit />'s child needed to be shrank to ${newSize}px.`);
      element.style[sizeProperty] = `${newSize}px`;
    };

    const shrinkToMaximumPossibleSize = (availableSpace) => {
      const newSize = Math.min(initialSize, availableSpace);
      shrinkToSize(newSize);
    };

    const shrinkToMinimum = () => {
      warnOnDev(`<Fit />'s child will not fit anywhere on the screen with its current ${minSizeProperty}.`);
      element.style[sizeProperty] = `${minSize}px`;
    };

    if (moreSpaceStart) {
      if (!minSize || willFitStart(minSize)) {
        shrinkToMaximumPossibleSize(availableStartSpace);
      } else {
        shrinkToMinimum();
      }
      displayStart();
    } else {
      if (!minSize || willFitEnd(minSize)) {
        shrinkToMaximumPossibleSize(availableEndSpace);
      } else {
        shrinkToMinimum();
      }
      displayEnd();
    }
  };

  let isResized;

  if (invertAxis) {
    isResized = displayStartIfFits() || displayEndIfFits();
  } else {
    isResized = displayEndIfFits() || displayStartIfFits();
  }

  if (!isResized) {
    displayWhereverShrinkedFits();
  }
};

const alignMainAxis = args => alignAxis(args);

const alignSecondaryAxis = args => alignAxis({
  ...args,
  axis: args.axis === 'x' ? 'y' : 'x',
  secondary: true,
});

const alignBothAxis = (args) => {
  const { invertAxis, invertSecondaryAxis, ...commonArgs } = args;

  alignMainAxis({
    ...commonArgs,
    invertAxis,
  });

  alignSecondaryAxis({
    ...commonArgs,
    invertAxis: invertSecondaryAxis,
  });
};

export default class Fit extends Component {
  get child() {
    const { children } = this.props;
    return React.Children.only(children);
  }

  fit = (element) => {
    if (!element) {
      return;
    }

    const parent = element.parentElement;

    /**
     * We need to ensure that <Fit />'s child has a absolute position. Otherwise,
     * we wouldn't be able to place the child in the correct position.
     */
    const style = window.getComputedStyle(element);
    const { position } = style;

    if (position !== 'absolute') {
      warnOnDev('<Fit />\'s child does not have absolute position. You should apply `position: absolute` to it.');
      element.style.position = 'absolute';
    }

    /**
     * We need to ensure that <Fit />'s parent has a relative position. Otherwise,
     * we wouldn't be able to place the child in the correct position.
     */
    const parentStyle = window.getComputedStyle(parent);
    const { position: parentPosition } = parentStyle;

    if (parentPosition !== 'relative' && parentPosition !== 'absolute') {
      warnOnDev('<Fit />\'s parent does not have relative position. You should apply `position: relative` to it.');
      parent.style.position = 'relative';
    }

    const { invertAxis, mainAxis, spacing } = this.props;

    alignBothAxis({
      element,
      invertAxis,
      axis: mainAxis,
      spacing,
    });
  }

  render() {
    const { child } = this;

    return React.cloneElement(
      child,
      { ref: this.fit },
    );
  }
}

Fit.propTypes = {
  children: PropTypes.node,
  invertAxis: PropTypes.bool,
  mainAxis: PropTypes.oneOf(['x', 'y']),
  spacing: PropTypes.number,
};

Fit.defaultProps = {
  mainAxis: 'y',
  spacing: 20,
};
