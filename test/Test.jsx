import React, { Component } from 'react';

import './Test.less';

import ElementWithPopover from './ElementWithPopover';

const BUTTON_WIDTH = 130;
const BUTTON_HEIGHT = 42;
const MARGIN = 10;

const BEGIN = { x: 'left', y: 'top' };
const END = { x: 'right', y: 'bottom' };

const corners = Array.from(new Array(4), (el, index) => ([index > 1, Boolean(index % 2)]));

export default class Test extends Component {
  state = {
    mainAxis: 'y',
  };

  renderElement({
    description, displayAbove, displayAlignRight, style,
  }) {
    const { mainAxis } = this.state;
    const secondAxis = { x: 'y', y: 'x' }[mainAxis];
    const MAIN_BEGIN = BEGIN[mainAxis];
    const MAIN_END = END[mainAxis];
    const SECOND_BEGIN = END[secondAxis];
    const SECOND_END = BEGIN[secondAxis];
    const first = displayAbove ? MAIN_BEGIN : MAIN_END;
    const second = `align-${displayAlignRight ? SECOND_BEGIN : SECOND_END}`;

    return (
      <div
        className="Test__elementWrapper"
        style={style}
      >
        <ElementWithPopover
          label={`${first} ${second} - ${description}`}
          mainAxis={mainAxis}
          invertAxis={displayAbove}
          invertSecondaryAxis={displayAlignRight}
        />
      </div>
    );
  }

  renderElements({ collideMainAxis, collideSecondaryAxis, description }) {
    return corners.map(([invertAxis, invertSecondaryAxis]) => {
      const displayAbove = collideSecondaryAxis ? !invertAxis : invertAxis;
      const displayAlignRight = collideMainAxis ? !invertSecondaryAxis : invertSecondaryAxis;
      const style = {};
      style[invertAxis ? 'bottom' : 'top'] = MARGIN + (collideMainAxis ? MARGIN + BUTTON_HEIGHT : 0);
      style[invertSecondaryAxis ? 'right' : 'left'] = MARGIN + (collideSecondaryAxis ? MARGIN + BUTTON_WIDTH : 0);

      return this.renderElement({
        description, displayAbove, displayAlignRight, style,
      });
    });
  }

  renderNoCollisionsElements() {
    return this.renderElements({ description: 'no collisions' });
  }

  renderMainCollisionElements() {
    const { mainAxis } = this.state;
    return this.renderElements({
      collideMainAxis: true,
      description: `${mainAxis === 'y' ? 'horizontal' : 'vertical'} collision`,
    });
  }

  renderSecondaryCollisionElements() {
    const { mainAxis } = this.state;
    return this.renderElements({
      collideSecondaryAxis: true,
      description: `${mainAxis === 'y' ? 'vertical' : 'horizontal'} collision`,
    });
  }

  renderBothCollisionElements() {
    return this.renderElements({
      collideMainAxis: true,
      collideSecondaryAxis: true,
      description: 'both collisions',
    });
  }

  render() {
    return (
      <div className="Test">
        <header>
          <h1>
            react-fit test page
          </h1>
        </header>
        <div className="Test__container">
          <main className="Test__container__content">
            {this.renderNoCollisionsElements()}
            {this.renderMainCollisionElements()}
            {this.renderSecondaryCollisionElements()}
            {this.renderBothCollisionElements()}
          </main>
        </div>
      </div>
    );
  }
}
