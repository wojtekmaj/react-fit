import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import detectElementOverflow from 'detect-element-overflow';

import { warnOnDev } from './shared/utils';

const isDisplayContentsSupported = 'CSS' in window && CSS.supports('display', 'contents');
const isMutationOberverSupported = 'MutationObserver' in window;

const upperCaseFirstLetter = a => a[0].toUpperCase() + a.slice(1, a.length);

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
  container,
  element,
  invertAxis,
  secondary,
  spacing,
}) => {
  const style = window.getComputedStyle(element);

  const scrollContainer = findScrollContainer(element);

  const parent = container.parentElement;
  const parentCollisions = detectElementOverflow(parent, scrollContainer);

  const isX = axis === 'x';
  const displayStartProperty = isX ? 'left' : 'top';
  const displayEndProperty = isX ? 'right' : 'bottom';
  const sizeProperty = isX ? 'width' : 'height';
  const overflowStartProperty = `overflow${upperCaseFirstLetter(displayStartProperty)}`;
  const overflowEndProperty = `overflow${upperCaseFirstLetter(displayEndProperty)}`;
  const uppercasedSizeProperty = upperCaseFirstLetter(sizeProperty);
  const offsetSizeProperty = `offset${uppercasedSizeProperty}`;
  const initialSizeProperty = `client${uppercasedSizeProperty}`;
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

  const displayIfFits = (willFit, display) => {
    const fits = willFit(initialSize);
    if (fits) {
      display();
    }
    return fits;
  };

  const displayStartIfFits = () => (
    displayIfFits(willFitStart, displayStart)
  );

  const displayEndIfFits = () => (
    displayIfFits(willFitEnd, displayEnd)
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

  let fits;

  if (invertAxis) {
    fits = displayStartIfFits() || displayEndIfFits();
  } else {
    fits = displayEndIfFits() || displayStartIfFits();
  }

  if (!fits) {
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
    if (!isDisplayContentsSupported) {
      // eslint-disable-next-line react/no-find-dom-node
      const element = findDOMNode(this);
      this.container = element;
      this.element = element;
    }
    this.fit();

    if (isMutationOberverSupported) {
      this.mutationOberver.observe(this.element, { attributeFilter: ['class', 'style'] });
    }
  }

  onMutation = () => {
    this.fit();
  };

  mutationOberver = isMutationOberverSupported && new MutationObserver(this.onMutation);

  fit = () => {
    const { container, element } = this;

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

    const parent = container.parentElement;

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
      container,
      element,
      invertAxis,
      invertSecondaryAxis,
      axis: mainAxis,
      spacing,
    });
  }

  render() {
    const { children } = this.props;

    const child = React.Children.only(children);

    if (isDisplayContentsSupported) {
      return (
        <div
          style={{ display: 'contents' }}
          ref={(ref) => {
            this.container = ref;
            this.element = ref && ref.firstChild;
          }}
        >
          {child}
        </div>
      );
    }

    return child;
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
