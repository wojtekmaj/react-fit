import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import detectElementOverflow from 'detect-element-overflow';

import { warnOnDev } from './shared/utils';

const upperCaseFirstLetter = a => a.slice(0, 1).toUpperCase() + a.slice(1, a.length);

const findScrollContainer = (element) => {
  if (!element) {
    return undefined;
  }

  let parent = element.parentElement;
  while (parent) {
    const { overflow } = window.getComputedStyle(parent);
    if (overflow.split(' ').every(o => o === 'auto' || o === 'scroll')) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
};

const alignAxis = ({
  axis,
  element,
  invertAxis,
  secondary,
  spacing,
}) => {
  const style = window.getComputedStyle(element);

  const scrollContainer = findScrollContainer(element);

  const parent = element.parentElement;
  const parentCollisions = detectElementOverflow(parent, scrollContainer);

  const isX = axis === 'x';
  const displayStartProperty = isX ? 'left' : 'top';
  const displayEndProperty = isX ? 'right' : 'bottom';
  const sizeProperty = isX ? 'width' : 'height';
  const overflowStartProperty = `overflow${upperCaseFirstLetter(displayStartProperty)}`;
  const overflowEndProperty = `overflow${upperCaseFirstLetter(displayEndProperty)}`;
  const offsetSizeProperty = `offset${upperCaseFirstLetter(sizeProperty)}`;
  const initialSizeProperty = `client${upperCaseFirstLetter(sizeProperty)}`;
  const minSizeProperty = `min-${sizeProperty}`;

  const scrollbarWidth = scrollContainer[offsetSizeProperty] - scrollContainer[initialSizeProperty];
  let availableStartSpace = -parentCollisions[overflowStartProperty] - spacing;
  let availableEndSpace = -parentCollisions[overflowEndProperty] - spacing - scrollbarWidth;

  if (secondary) {
    availableStartSpace += parent[initialSizeProperty];
    availableEndSpace += parent[initialSizeProperty];
  }

  const initialSize = element[initialSizeProperty];

  const willFitStart = size => size <= availableStartSpace;
  const willFitEnd = size => size <= availableEndSpace;

  const displayStart = () => {
    element.style[displayStartProperty] = 'unset';
    element.style[displayEndProperty] = secondary ? '0' : '100%';
  };

  const displayEnd = () => {
    element.style[displayStartProperty] = secondary ? '0' : '100%';
    element.style[displayEndProperty] = 'unset';
  };

  const displayIfFits = (size, willFit, display) => {
    const fits = willFit(size);
    if (fits) {
      display();
    }
    return fits;
  };

  const displayStartIfFits = () => (
    displayIfFits(initialSize, willFitStart, displayStart)
  );

  const displayEndIfFits = () => (
    displayIfFits(initialSize, willFitEnd, displayEnd)
  );

  const displayWhereverShrinkedFits = () => {
    const moreSpaceStart = availableStartSpace > availableEndSpace;
    const minSize = style[minSizeProperty] && parseInt(style[minSizeProperty], 10);

    const shrinkToSize = (newSize) => {
      warnOnDev(`<Fit />'s child needed to have its ${sizeProperty} decreased to ${newSize}px.`);
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
  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    this.element = findDOMNode(this);

    this.fit(this.element);
    this.mutationOberver.observe(this.element, { attributeFilter: ['class', 'style'] });
  }

  onMutation = () => {
    this.fit(this.element);
  };

  mutationOberver = new MutationObserver(this.onMutation);

  fit = (element) => {
    if (!element) {
      return;
    }

    const elementWidth = element.clientWidth;
    const elementHeight = element.clientHeight;

    // No need to recalculate - already did that for current dimensions
    if (this.elementWidth === elementWidth && this.elementHeight === elementHeight) {
      return;
    }

    // Save the dimensions so that we know we don't need to repeat the function if unchanged
    this.elementWidth = elementWidth;
    this.elementHeight = elementHeight;

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

    const {
      invertAxis,
      invertSecondaryAxis,
      mainAxis,
      spacing,
    } = this.props;

    alignBothAxis({
      element,
      invertAxis,
      invertSecondaryAxis,
      axis: mainAxis,
      spacing,
    });
  }

  render() {
    const { children } = this.props;

    return React.Children.only(children);
  }
}

Fit.propTypes = {
  children: PropTypes.node,
  invertAxis: PropTypes.bool,
  invertSecondaryAxis: PropTypes.bool,
  mainAxis: PropTypes.oneOf(['x', 'y']),
  spacing: PropTypes.number,
};

Fit.defaultProps = {
  mainAxis: 'y',
  spacing: 8,
};
