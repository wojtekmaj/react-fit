import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Fit from 'react-fit/src/Fit';

export default function ElementWithPopover({ label, spacing = 10, ...otherProps }) {
  const [isOpen, setIsOpen] = useState(null);

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
              const style = {};
              ['top', 'bottom', 'left', 'right'].forEach((prop) => {
                if (ref.style[prop]) {
                  style[prop] = ref.style[prop];
                }
              });

              const el = ref.querySelector('pre[name="style"]');
              el.innerHTML = JSON.stringify(style, null, '  ');
            });
          }}
        >
          <pre name="props">{JSON.stringify(otherProps, null, '  ')}</pre>
          <pre name="style" />
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

ElementWithPopover.propTypes = {
  label: PropTypes.node,
  spacing: PropTypes.number,
};
