import { useId, useState } from 'react';
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
  const propsId = useId();
  const styleId = useId();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  function togglePopover() {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  }

  function renderLabel() {
    return (
      <button aria-expanded={isOpen || false} onClick={togglePopover} type="button">
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
              for (const prop of ['top', 'bottom', 'left', 'right'] as const) {
                if (ref.style[prop]) {
                  style[prop] = ref.style[prop];
                }
              }

              const el = ref.querySelector(`#${styleId}`) as HTMLElement;
              el.innerHTML = JSON.stringify(style, null, '  ');
            });
          }}
        >
          <pre id={propsId}>{JSON.stringify(otherProps, null, '  ')}</pre>
          <pre id={styleId} />
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
