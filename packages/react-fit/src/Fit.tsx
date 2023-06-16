'use client';

import { Children, useCallback, useEffect, useRef } from 'react';
import detectElementOverflow from 'detect-element-overflow';
import warning from 'warning';

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
  children: React.ReactElement;
  invertAxis?: boolean;
  invertSecondaryAxis?: boolean;
  mainAxis?: 'x' | 'y';
  spacing?: number | Spacing;
};

export default function Fit({
  children,
  invertAxis,
  invertSecondaryAxis,
  mainAxis = 'y',
  spacing = 8,
}: FitProps) {
  const container = useRef<HTMLElement | undefined>(undefined);
  const element = useRef<HTMLElement | undefined>(undefined);
  const elementWidth = useRef<number | undefined>(undefined);
  const elementHeight = useRef<number | undefined>(undefined);
  const scrollContainer = useRef<HTMLElement | undefined>(undefined);

  const fit = useCallback(() => {
    if (!scrollContainer.current || !container.current || !element.current) {
      return;
    }

    const currentElementWidth = element.current.clientWidth;
    const currentElementHeight = element.current.clientHeight;

    // No need to recalculate - already did that for current dimensions
    if (
      elementWidth.current === currentElementWidth &&
      elementHeight.current === currentElementHeight
    ) {
      return;
    }

    // Save the dimensions so that we know we don't need to repeat the function if unchanged
    elementWidth.current = currentElementWidth;
    elementHeight.current = currentElementHeight;

    const parent = container.current.parentElement;

    // Container was unmounted
    if (!parent) {
      return;
    }

    /**
     * We need to ensure that <Fit />'s child has a absolute position. Otherwise,
     * we wouldn't be able to place the child in the correct position.
     */
    const style = window.getComputedStyle(element.current);
    const { position } = style;

    if (position !== 'absolute') {
      element.current.style.position = 'absolute';
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

    alignBothAxis({
      axis: mainAxis,
      container: container.current,
      element: element.current,
      invertAxis,
      invertSecondaryAxis,
      scrollContainer: scrollContainer.current,
      spacing,
    });
  }, [invertAxis, invertSecondaryAxis, mainAxis, spacing]);

  const child = Children.only(children);

  useEffect(() => {
    fit();

    function onMutation() {
      fit();
    }

    if (isMutationObserverSupported && element.current) {
      const mutationObserver = new MutationObserver(onMutation);

      mutationObserver.observe(element.current, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }
  }, [fit]);

  function assignRefs(domElement: Element | null) {
    if (!domElement || !(domElement instanceof HTMLElement)) {
      return;
    }

    element.current = domElement;
    scrollContainer.current = findScrollContainer(domElement);
  }

  return (
    <span
      ref={(domContainer) => {
        if (!domContainer) {
          return;
        }

        container.current = domContainer;
        const domElement = domContainer?.firstElementChild;

        assignRefs(domElement);
      }}
      style={{ display: 'contents' }}
    >
      {child}
    </span>
  );
}
