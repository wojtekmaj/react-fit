import React from 'react';

import './Test.less';

import ElementWithPopover from './ElementWithPopover';

const Test = () => (
  <div className="Test">
    <header>
      <h1>
        react-fit test page
      </h1>
    </header>
    <div className="Test__container">
      <main className="Test__container__content">
        <div
          className="Test__elementWrapper"
          style={{ top: 10, left: 10 }}
        >
          <ElementWithPopover
            label="Bottom left - no collisions"
          />
        </div>
        <div
          className="Test__elementWrapper"
          style={{ bottom: 10, right: 10 }}
        >
          <ElementWithPopover
            label="Top right - no collisions"
            invertAxis
            invertSecondaryAxis
          />
        </div>
        <div
          className="Test__elementWrapper"
          style={{ top: 62, right: 10 }}
        >
          <ElementWithPopover
            label="Bottom left - horizontal collision"
          />
        </div>
        <div
          className="Test__elementWrapper"
          style={{ bottom: 10, left: 150 }}
        >
          <ElementWithPopover
            label="Bottom left - vertical collision"
          />
        </div>
        <div
          className="Test__elementWrapper"
          style={{ bottom: 62, left: 10 }}
        >
          <ElementWithPopover
            label="Top right - horizontal collision"
            invertAxis
            invertSecondaryAxis
          />
        </div>
        <div
          className="Test__elementWrapper"
          style={{ top: 10, right: 150 }}
        >
          <ElementWithPopover
            label="Top right - vertical collision"
            invertAxis
            invertSecondaryAxis
          />
        </div>
      </main>
    </div>
  </div>
);

export default Test;
