[![npm](https://img.shields.io/npm/v/react-fit.svg)](https://www.npmjs.com/package/react-fit) ![downloads](https://img.shields.io/npm/dt/react-fit.svg) [![CI](https://github.com/wojtekmaj/react-fit/workflows/CI/badge.svg)](https://github.com/wojtekmaj/react-fit/actions) ![dependencies](https://img.shields.io/david/wojtekmaj/react-fit.svg
) ![dev dependencies](https://img.shields.io/david/dev/wojtekmaj/react-fit.svg
)

# React-Fit
A component that aligns its child relatively to its parent while being aware where it may and may not fit.

## tl;dr
* Install by executing `npm install react-fit` or `yarn add react-fit`.
* Import by adding `import Fit from 'react-fit'`.
* Do stuff with it!
    ```js
    const ElementWithChild = () => (
      <Parent>
        <Fit>
          <PopoverChild />
        </Fit>
      </Parent>
    );
    ```

## Getting started

### Compatibility

Your project needs to use React 15.5 or later.

A bug in React 16.5.x causes React-Fit to crash on [browsers not supporting `display: contents`](https://caniuse.com/#feat=css-display-contents). While React-Fit will continue to work on React 16.5.x, it's highly recommended that you either upgrade to ^16.6.0 or downgrade to <=16.4.2.

## How does it work?

1. By default, the element provided to `<Fit />` as a child is displayed below its parent, aligned to the left.
2. If the element can't fit in this position and collides with bottom and/or right border of the container, `<Fit />` checks if there's more space for the element on the other side(s) of the axis/axes the collision(s) has been detected on. If so, the element is moved above its parent and/or aligned to the right, depending on the collision axis.
3. If the element still can't fit where it's placed, `<Fit />` decreases the element's size. If `min-width`/`min-height` are provided, they will be respected.

## Positioning the element

### Vertical axis (default)

By default, the element is displayed below its parent, aligned to the left of its parent.

```
┌────────────┐
│   Parent   │
├────────────┴────────────┐
│                         │
│         Child           │
│                         │
└─────────────────────────┘
```

* To display the element above: provide `invertAxis` flag.
* To align the element to the right: provide `invertSecondaryAxis` flag.

### Horizontal axis (`mainAxis="x"`)

By providing `mainAxis="x"` to `<Fit />`, the element is displayed on the right of its parent, aligned to the top of its parent.

```
┌────────────┬─────────────────────────┐
│   Parent   │                         │
└────────────┤         Child           │
             │                         │
             └─────────────────────────┘
```

* To display the element on the left: provide `invertAxis` flag.
* To align the element to the bottom: provide `invertSecondaryAxis` flag.

### Spacing

By default, React-Fit leaves 8px of space between its child and the borders of the container.

```
┌──────────────────────────────────────────┐
│ ┌────────────┐                           │
│ │   Parent   │                           │
│ ├────────────┴────────────┐              │
│ │                         │              │
│ │         Child           │              │
│ │                         │              │
│ └─────────────────────────┘              │
└──────────────────────────────────────────┘
```

If you wish to change this spacing, you can provide `spacing` to `<Fit />`. For example, if you wish for the child to touch the borders of the container, decrease the spacing by providing `spacing={0}` to `<Fit />`.

```
┌──────────────────────────────────────────┐
│ ┌────────────┐                           │
│ │   Parent   │                           │
│ ├────────────┴────────────┐              │
│ │                         │              │
│ │         Child           │              │
│ │      (now higher)       │              │
│ │                         │              │
└─┴─────────────────────────┴──────────────┘
```

You can also provide different spacing for each side by providing an object, for example `spacing={{ top: 10, bottom: 20, left: 30, right: 40 }}`, to `<Fit />`. **Note:** Memoize the object or define it outside render function to avoid unnecessary re-renders.

## License

The MIT License.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/wojtekmaj.png?s=100" width="100">
    </td>
    <td>
      Wojciech Maj<br />
      <a href="mailto:kontakt@wojtekmaj.pl">kontakt@wojtekmaj.pl</a><br />
      <a href="https://wojtekmaj.pl">https://wojtekmaj.pl</a>
    </td>
  </tr>
</table>
