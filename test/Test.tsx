import './Test.css';

import ElementWithPopover from './ElementWithPopover.js';

/* eslint-disable react/no-unused-prop-types */

const BUTTON_WIDTH = 130;
const BUTTON_HEIGHT = 42;
const MARGIN = 10;

const BEGIN = { x: 'left', y: 'top' };
const END = { x: 'right', y: 'bottom' };

const corners: [boolean, boolean][] = Array.from(new Array(4), (el, index) => [
  index > 1,
  Boolean(index % 2),
]);

export default function Test() {
  const mainAxis = 'y';

  function renderElement({
    description,
    displayAbove,
    displayAlignRight,
    style,
  }: {
    description: string;
    displayAbove: boolean;
    displayAlignRight: boolean;
    style: React.CSSProperties;
  }) {
    const secondAxis = ({ x: 'y', y: 'x' } as const)[mainAxis];
    const MAIN_BEGIN = BEGIN[mainAxis];
    const MAIN_END = END[mainAxis];
    const SECOND_BEGIN = END[secondAxis];
    const SECOND_END = BEGIN[secondAxis];
    const first = displayAbove ? MAIN_BEGIN : MAIN_END;
    const second = `align-${displayAlignRight ? SECOND_BEGIN : SECOND_END}`;

    return (
      <div key={`${first}_${second}_${description}`} className="Test__elementWrapper" style={style}>
        <ElementWithPopover
          invertAxis={displayAbove}
          invertSecondaryAxis={displayAlignRight}
          label={`${first} ${second} - ${description}`}
          mainAxis={mainAxis}
        />
      </div>
    );
  }

  function renderElements({
    collideMainAxis,
    collideSecondaryAxis,
    description,
  }: {
    collideMainAxis?: boolean;
    collideSecondaryAxis?: boolean;
    description: string;
  }) {
    return corners.map(([invertAxis, invertSecondaryAxis]) => {
      const displayAbove = collideSecondaryAxis ? !invertAxis : invertAxis;
      const displayAlignRight = collideMainAxis ? !invertSecondaryAxis : invertSecondaryAxis;
      const style: React.CSSProperties = {};
      style[invertAxis ? 'bottom' : 'top'] =
        MARGIN + (collideMainAxis ? MARGIN + BUTTON_HEIGHT : 0);
      style[invertSecondaryAxis ? 'right' : 'left'] =
        MARGIN + (collideSecondaryAxis ? MARGIN + BUTTON_WIDTH : 0);

      return renderElement({
        description,
        displayAbove,
        displayAlignRight,
        style,
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
        <h1>react-fit test page</h1>
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
