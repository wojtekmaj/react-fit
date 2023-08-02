'use client';

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import detectElementOverflow from 'detect-element-overflow';
import warning from 'tiny-warning';

type SpacingKeys = 'bottom' | 'left' | 'right' | 'top';

type Spacing = number | { [key in SpacingKeys]: number };

type AlignAxisOptions = {
  axis: 'x' | 'y';
  container: HTMLElement;
  element: HTMLElement;
  invertAxis?: boolean;
  scrollContainer: HTMLElement;
  secondary?: boolean;
  spacing: Spacing;
};

type AlignBothAxisOptions = AlignAxisOptions & {
  invertSecondaryAxis?: boolean;
};

type SizeProperty = 'width' | 'height';
type StartProperty = 'left' | 'top';
type EndProperty = 'right' | 'bottom';

type ClientSizeProperty = 'clientWidth' | 'clientHeight';
type MinSizeProperty = 'min-width' | 'min-height';
type OffsetProperty = 'offsetWidth' | 'offsetHeight';
type OverflowProperty = 'overflowLeft' | 'overflowRight' | 'overflowTop' | 'overflowBottom';
type ScrollProperty = 'scrollLeft' | 'scrollTop';

const isBrowser = typeof document !== 'undefined';

const isDisplayContentsSupported =
  isBrowser && 'CSS' in window && 'supports' in window.CSS && CSS.supports('display', 'contents');

const isMutationObserverSupported = isBrowser && 'MutationObserver' in window;

function capitalize<T extends string>(string: T): Capitalize<T> {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;
}

function findScrollContainer(element: HTMLElement): HTMLElement {
  let parent = element.parentElement;
  while (parent) {
    const { overflow } = window.getComputedStyle(parent);
    if (overflow.split(' ').every((o) => o === 'auto' || o === 'scroll')) {
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
  scrollContainer,
  secondary,
  spacing,
}: AlignAxisOptions) {
  const style = window.getComputedStyle(element);

  const parent = container.parentElement;

  if (!parent) {
    return;
  }

  const scrollContainerCollisions = detectElementOverflow(parent, scrollContainer);
  const documentCollisions = detectElementOverflow(parent, document.documentElement);

  const isX = axis === 'x';
  const startProperty: StartProperty = isX ? 'left' : 'top';
  const endProperty: EndProperty = isX ? 'right' : 'bottom';
  const sizeProperty: SizeProperty = isX ? 'width' : 'height';
  const overflowStartProperty: OverflowProperty = `overflow${capitalize(startProperty)}` as const;
  const overflowEndProperty: OverflowProperty = `overflow${capitalize(endProperty)}` as const;
  const scrollProperty: ScrollProperty = `scroll${capitalize(startProperty)}` as const;
  const uppercasedSizeProperty = capitalize(sizeProperty);
  const offsetSizeProperty: OffsetProperty = `offset${uppercasedSizeProperty}`;
  const clientSizeProperty: ClientSizeProperty = `client${uppercasedSizeProperty}`;
  const minSizeProperty: MinSizeProperty = `min-${sizeProperty}`;

  const scrollbarWidth = scrollContainer[offsetSizeProperty] - scrollContainer[clientSizeProperty];

  const startSpacing = typeof spacing === 'object' ? spacing[startProperty] : spacing;
  let availableStartSpace =
    -Math.max(
      scrollContainerCollisions[overflowStartProperty],
      documentCollisions[overflowStartProperty] + document.documentElement[scrollProperty],
    ) - startSpacing;

  const endSpacing = typeof spacing === 'object' ? spacing[endProperty] : spacing;
  let availableEndSpace =
    -Math.max(
      scrollContainerCollisions[overflowEndProperty],
      documentCollisions[overflowEndProperty] - document.documentElement[scrollProperty],
    ) -
    endSpacing -
    scrollbarWidth;

  if (secondary) {
    availableStartSpace += parent[clientSizeProperty];
    availableEndSpace += parent[clientSizeProperty];
  }

  const offsetSize = element[offsetSizeProperty];

  function displayStart() {
    element.style[startProperty] = 'auto';
    element.style[endProperty] = secondary ? '0' : '100%';
  }

  function displayEnd() {
    element.style[startProperty] = secondary ? '0' : '100%';
    element.style[endProperty] = 'auto';
  }

  function displayIfFits(availableSpace: number, display: () => void) {
    const fits = offsetSize <= availableSpace;
    if (fits) {
      display();
    }
    return fits;
  }

  function displayStartIfFits() {
    return displayIfFits(availableStartSpace, displayStart);
  }

  function displayEndIfFits() {
    return displayIfFits(availableEndSpace, displayEnd);
  }

  function displayWhereverShrinkedFits() {
    const moreSpaceStart = availableStartSpace > availableEndSpace;

    const rawMinSize = style.getPropertyValue(minSizeProperty);
    const minSize = rawMinSize ? parseInt(rawMinSize, 10) : null;

    function shrinkToSize(size: number) {
      warning(
        !minSize || size >= minSize,
        `<Fit />'s child will not fit anywhere with its current ${minSizeProperty} of ${minSize}px.`,
      );

      const newSize = Math.max(size, minSize || 0);
      warning(
        false,
        `<Fit />'s child needed to have its ${sizeProperty} decreased to ${newSize}px.`,
      );
      element.style[sizeProperty] = `${newSize}px`;
    }

    if (moreSpaceStart) {
      shrinkToSize(availableStartSpace);
      displayStart();
    } else {
      shrinkToSize(availableEndSpace);
      displayEnd();
    }
  }

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

function alignMainAxis(args: AlignAxisOptions) {
  alignAxis(args);
}

function alignSecondaryAxis(args: AlignAxisOptions) {
  alignAxis({
    ...args,
    axis: args.axis === 'x' ? 'y' : 'x',
    secondary: true,
  });
}

function alignBothAxis(args: AlignBothAxisOptions) {
  const { invertAxis, invertSecondaryAxis, ...commonArgs } = args;

  alignMainAxis({
    ...commonArgs,
    invertAxis,
  });

  alignSecondaryAxis({
    ...commonArgs,
    invertAxis: invertSecondaryAxis,
  });
}

export type FitProps = {
  children: React.ReactElement | React.ReactElement[];
  invertAxis?: boolean;
  invertSecondaryAxis?: boolean;
  mainAxis?: 'x' | 'y';
  spacing?: number | Spacing;
};

export default class Fit extends Component<FitProps> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    invertAxis: PropTypes.bool,
    invertSecondaryAxis: PropTypes.bool,
    mainAxis: PropTypes.oneOf(['x', 'y'] as const),
    spacing: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        bottom: PropTypes.number.isRequired,
        left: PropTypes.number.isRequired,
        right: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
      }),
    ]),
  };

  componentDidMount() {
    if (!isDisplayContentsSupported) {
      // eslint-disable-next-line react/no-find-dom-node
      const element = findDOMNode(this);

      if (!element || !(element instanceof HTMLElement)) {
        return;
      }

      this.container = element;
      this.element = element;
      this.scrollContainer = findScrollContainer(element);
    }

    this.fit();

    const onMutation = () => {
      this.fit();
    };

    if (isMutationObserverSupported && this.element) {
      const mutationObserver = new MutationObserver(onMutation);

      mutationObserver.observe(this.element, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }
  }

  container?: HTMLElement | null;
  element?: HTMLElement | null;
  elementWidth?: number;
  elementHeight?: number;
  scrollContainer?: HTMLElement;

  fit = () => {
    const { scrollContainer, container, element } = this;

    if (!scrollContainer || !container || !element) {
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
      element.style.position = 'absolute';
    }

    /**
     * We need to ensure that <Fit />'s parent has a relative or absolute position. Otherwise,
     * we wouldn't be able to place the child in the correct position.
     */
    const parentStyle = window.getComputedStyle(parent);
    const { position: parentPosition } = parentStyle;

    if (parentPosition !== 'relative' && parentPosition !== 'absolute') {
      parent.style.position = 'relative';
    }

    const { invertAxis, invertSecondaryAxis, mainAxis = 'y', spacing = 8 } = this.props;

    alignBothAxis({
      axis: mainAxis,
      container,
      element,
      invertAxis,
      invertSecondaryAxis,
      scrollContainer,
      spacing,
    });
  };

  render() {
    const { children } = this.props;

    const child = React.Children.only(children);

    if (isDisplayContentsSupported) {
      return (
        <span
          ref={(container) => {
            this.container = container;

            const element = container && container.firstElementChild;

            if (!element || !(element instanceof HTMLElement)) {
              return;
            }

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
