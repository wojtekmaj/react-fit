import React from 'react';

import './Test.less';

import ElementWithPopover from './ElementWithPopover';

const BUTTON_WIDTH = 130;
const BUTTON_HEIGHT = 42;
const MARGIN = 10;

const BEGIN = { x: 'left', y: 'top' };
const END = { x: 'right', y: 'bottom' };

const corners = Array.from(new Array(4), (el, index) => ([index > 1, Boolean(index % 2)]));

export default function Test() {
  const mainAxis = 'y';

  function renderElement({
    // eslint-disable-next-line react/prop-types
    description, displayAbove, displayAlignRight, style,
  }) {
    const secondAxis = { x: 'y', y: 'x' }[mainAxis];
    const MAIN_BEGIN = BEGIN[mainAxis];
    const MAIN_END = END[mainAxis];
    const SECOND_BEGIN = END[secondAxis];
    const SECOND_END = BEGIN[secondAxis];
    const first = displayAbove ? MAIN_BEGIN : MAIN_END;
    const second = `align-${displayAlignRight ? SECOND_BEGIN : SECOND_END}`;

    return (
      <div
        key={`${first}_${second}_${description}`}
        className="Test__elementWrapper"
        style={style}
      >
        <ElementWithPopover
          invertAxis={displayAbove}
          invertSecondaryAxis={displayAlignRight}
          label={`${first} ${second} - ${description}`}
          mainAxis={mainAxis}
        />
      </div>
    );
  }

  function renderElements({ collideMainAxis, collideSecondaryAxis, description }) {
    return corners.map(([invertAxis, invertSecondaryAxis]) => {
      const displayAbove = collideSecondaryAxis ? !invertAxis : invertAxis;
      const displayAlignRight = collideMainAxis ? !invertSecondaryAxis : invertSecondaryAxis;
      const style = {};
      style[invertAxis ? 'bottom' : 'top'] = MARGIN + (collideMainAxis ? MARGIN + BUTTON_HEIGHT : 0);
      style[invertSecondaryAxis ? 'right' : 'left'] = MARGIN + (collideSecondaryAxis ? MARGIN + BUTTON_WIDTH : 0);

      return renderElement({
        description, displayAbove, displayAlignRight, style,
      });
    });
  }

  function renderNoCollisionsElements() {
    return renderElements({ description: 'no collisions' });
  }

  function renderMainCollisionElements() {
    return renderElements({
      collideMainAxis: true,
      description: `${mainAxis === 'y' ? 'horizontal' : 'vertical'} collision`,
    });
  }

  function renderSecondaryCollisionElements() {
    return renderElements({
      collideSecondaryAxis: true,
      description: `${mainAxis === 'y' ? 'vertical' : 'horizontal'} collision`,
    });
  }

  function renderBothCollisionElements() {
    return renderElements({
      collideMainAxis: true,
      collideSecondaryAxis: true,
      description: 'both collisions',
    });
  }

  return (
    <div className="Test">
      <header>
        <h1>
          react-fit test page
        </h1>
      </header>
      <div className="Test__container">
        <main className="Test__container__content">
          {renderNoCollisionsElements()}
          {renderMainCollisionElements()}
          {renderSecondaryCollisionElements()}
          {renderBothCollisionElements()}
        </main>
      </div>
    </div>
  );
}
