import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import detectElementOverflow from 'detect-element-overflow';

import { warnOnDev } from './shared/utils';

const isDisplayContentsSupported = typeof window !== 'undefined' && 'CSS' in window && CSS.supports('display', 'contents');
const isMutationObserverSupported = typeof window !== 'undefined' && 'MutationObserver' in window;

const capitalize = a => a[0].toUpperCase() + a.slice(1);

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
  const startProperty = isX ? 'left' : 'top';
  const endProperty = isX ? 'right' : 'bottom';
  const sizeProperty = isX ? 'width' : 'height';
  const overflowStartProperty = `overflow${capitalize(startProperty)}`;
  const overflowEndProperty = `overflow${capitalize(endProperty)}`;
  const uppercasedSizeProperty = capitalize(sizeProperty);
  const offsetSizeProperty = `offset${uppercasedSizeProperty}`;
  const clientSizeProperty = `client${uppercasedSizeProperty}`;
  const minSizeProperty = `min-${sizeProperty}`;

  const scrollbarWidth = scrollContainer[offsetSizeProperty] - scrollContainer[clientSizeProperty];
  let availableStartSpace = -parentCollisions[overflowStartProperty] - spacing;
  let availableEndSpace = -parentCollisions[overflowEndProperty] - spacing - scrollbarWidth;

  if (secondary) {
    availableStartSpace += parent[clientSizeProperty];
    availableEndSpace += parent[clientSizeProperty];
  }

  const offsetSize = element[offsetSizeProperty];

  const displayStart = () => {
    element.style[startProperty] = 'unset';
    element.style[endProperty] = secondary ? '0' : '100%';
  };

  const displayEnd = () => {
    element.style[startProperty] = secondary ? '0' : '100%';
    element.style[endProperty] = 'unset';
  };

  const displayIfFits = (availableSpace, display) => {
    const fits = offsetSize <= availableSpace;
    if (fits) {
      display();
    }
    return fits;
  };

  const displayStartIfFits = () => (
    displayIfFits(availableStartSpace, displayStart)
  );

  const displayEndIfFits = () => (
    displayIfFits(availableEndSpace, displayEnd)
  );

  const displayWhereverShrinkedFits = () => {
    const moreSpaceStart = availableStartSpace > availableEndSpace;
    const minSize = style[minSizeProperty] && parseInt(style[minSizeProperty], 10);

    const shrinkToSize = (size) => {
      if (minSize && size < minSize) {
        warnOnDev(`<Fit />'s child will not fit anywhere with its current ${minSizeProperty} of ${minSize}px.`);
      }

      const newSize = Math.max(size, minSize || 0);
      warnOnDev(`<Fit />'s child needed to have its ${sizeProperty} decreased to ${newSize}px.`);
      element.style[sizeProperty] = `${newSize}px`;
    };

    if (moreSpaceStart) {
      shrinkToSize(availableStartSpace);
      displayStart();
    } else {
      shrinkToSize(availableEndSpace);
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

    if (isMutationObserverSupported) {
      this.mutationObserver.observe(this.element, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }
  }

  onMutation = () => {
    this.fit();
  };

  // Has to be defined after onMutation
  // eslint-disable-next-line react/sort-comp
  mutationObserver = isMutationObserverSupported && new MutationObserver(this.onMutation);

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
