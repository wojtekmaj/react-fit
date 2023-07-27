import React, { useState } from 'react';
import clsx from 'clsx';

import Fit from 'react-fit';

type ElementWithPopoverProps = {
  label?: React.ReactNode;
  spacing?: number;
} & Omit<React.ComponentProps<typeof Fit>, 'children'>;

export default function ElementWithPopover({
  label,
  spacing = 10,
  ...otherProps
}: ElementWithPopoverProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  function togglePopover() {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  }

  function renderLabel() {
    return (
      <button onClick={togglePopover} type="button">
        {label}
      </button>
    );
  }

  function renderPopover() {
    if (isOpen === null) {
      return null;
    }

    return (
      <Fit spacing={spacing} {...otherProps}>
        <div
          className={clsx(
            'ElementWithPopover__popover',
            isOpen && 'ElementWithPopover__popover--isOpen',
          )}
          ref={(ref) => {
            if (!ref) {
              return;
            }

            requestAnimationFrame(() => {
              const style: Record<string, unknown> = {};
              (['top', 'bottom', 'left', 'right'] as const).forEach((prop) => {
                if (ref.style[prop]) {
                  style[prop] = ref.style[prop];
                }
              });

              const el = ref.querySelector('pre[id="style"]') as HTMLElement;
              el.innerHTML = JSON.stringify(style, null, '  ');
            });
          }}
        >
          <pre id="props">{JSON.stringify(otherProps, null, '  ')}</pre>
          <pre id="style" />
        </div>
      </Fit>
    );
  }

  return (
    <div className="ElementWithPopover">
      {renderLabel()}
      {renderPopover()}
    </div>
  );
}
