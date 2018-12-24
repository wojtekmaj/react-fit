# React-Fit
A component that aligns its child relatively to its parent while being aware where it may and may not fit.

## tl;dr
* Install by executing `npm install react-fit` or `yarn add react-fit`.
* Import by adding `import Fit from 'fit'`.
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

## How does it work?
1. By default, the element provided to `<Fit />` as a child is displayed below its parent, aligned to the left.
2. If the element can't fit in this position and collides with bottom and/or right border of the window, `<Fit />` checks if there's more space for the element on the other side(s) of the axis/axes the collision(s) has been detected on. If so, the element is moved above its parent and/or aligned to the right, depending on collision axis.
3. If the element still can't fit where it's placed, `<Fit />` decreases element's size. If `min-width`/`min-height` are provided, they will be respected.

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
      <a href="http://wojtekmaj.pl">http://wojtekmaj.pl</a>
    </td>
  </tr>
</table>
