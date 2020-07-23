import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import detectElementOverflow from 'detect-element-overflow';

import { warnOnDev } from './shared/utils';

const isBrowser = typeof window !== 'undefined';

const isDisplayContentsSupported = (
  isBrowser
  && 'CSS' in window
  && 'supports' in window.CSS
  && CSS.supports('display', 'contents')
);

const isMutationObserverSupported = (
  isBrowser
  && 'MutationObserver' in window
);

function capitalize(a) {
  return a[0].toUpperCase() + a.slice(1);
}

function findScrollContainer(element) {
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
}

function alignAxis({
  axis,
  container,
  element,
  invertAxis,
  secondary,
  scrollContainer,
  spacing,
}) {
  const style = window.getComputedStyle(element);

  const parent = container.parentElement;
  const scrollContainerCollisions = detectElementOverflow(parent, scrollContainer);
  const documentCollisions = detectElementOverflow(parent, document.documentElement);

  const isX = axis === 'x';
  const startProperty = isX ? 'left' : 'top';
  const endProperty = isX ? 'right' : 'bottom';
  const sizeProperty = isX ? 'width' : 'height';
  const overflowStartProperty = `overflow${capitalize(startProperty)}`;
  const overflowEndProperty = `overflow${capitalize(endProperty)}`;
  const scrollProperty = `scroll${capitalize(startProperty)}`;
  const uppercasedSizeProperty = capitalize(sizeProperty);
  const offsetSizeProperty = `offset${uppercasedSizeProperty}`;
  const clientSizeProperty = `client${uppercasedSizeProperty}`;
  const minSizeProperty = `min-${sizeProperty}`;

  const scrollbarWidth = scrollContainer[offsetSizeProperty] - scrollContainer[clientSizeProperty];

  let availableStartSpace = (
    -Math.max(
      scrollContainerCollisions[overflowStartProperty],
      documentCollisions[overflowStartProperty] + document.documentElement[scrollProperty],
    )
    - spacing
  );
  let availableEndSpace = (
    -Math.max(
      scrollContainerCollisions[overflowEndProperty],
      documentCollisions[overflowEndProperty] - document.documentElement[scrollProperty],
    )
    - spacing
    - scrollbarWidth
  );

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
}

function alignMainAxis(args) {
  alignAxis(args);
}

function alignSecondaryAxis(args) {
  alignAxis({
    ...args,
    axis: args.axis === 'x' ? 'y' : 'x',
    secondary: true,
  });
}

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
      this.scrollContainer = findScrollContainer(element);
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
    const { scrollContainer, container, element } = this;

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

    // Container was unmounted
    if (!parent) {
      return;
    }

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
      scrollContainer,
      spacing,
    });
  }

  render() {
    const { children } = this.props;

    const child = React.Children.only(children);

    if (isDisplayContentsSupported) {
      return (
        <span
          ref={(container) => {
            this.container = container;

            const element = container && container.firstChild;
            this.element = element;

            this.scrollContainer = findScrollContainer(element);
          }}
          style={{ display: 'contents' }}
        >
          {child}
        </span>
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
