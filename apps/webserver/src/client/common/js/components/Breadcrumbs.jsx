import React from 'react';

import '../../css/breadcrumbs.scss';

function insertSeparators(items, className, separator) {
  return items.reduce((acc, current, index) => {
    if (index < items.length - 1) {
      acc = acc.concat(
        current,
        <li aria-hidden key={`separator-${index}`} className={className}>
          {separator}
        </li>
      );
    } else {
      acc.push(current);
    }

    return acc;
  }, []);
}

/**
 * A generic breadcrumb component inspired by Material UI Breadcrumbs
 *
 * Each child of this component will be an item in the breadcrumb list. The children
 * must all be valid React elements as defined by React.isValidElement.
 *
 * Code for this component was copied heavily from:
 * https://github.com/mui-org/material-ui/blob/v4.9.13/packages/material-ui/src/Breadcrumbs/Breadcrumbs.js
 * This component can be replaced with Material UI Breadcrumbs if we ever upgrade
 *
 * @param {className} string: Class name for the parent breadcrumb wrapper
 * @param {itemClass} string: Class attached to each child li element
 * @param {separator} string: The separator to use between child items
 * @param {separatorClass} string: Class attached to each separator element
 */
const Breadcrumbs = ({
  children,
  className = 'breadcrumb',
  itemClass = 'breadcrumb__item',
  separator = '/',
  separatorClass = 'breadcrumb__separator',
}) => {
  const allItems = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child, index) => (
      <li className={itemClass} key={`child-${index}`}>
        {child}
      </li>
    ));
  return (
    <div className={className}>
      <ol>{insertSeparators(allItems, separatorClass, separator)}</ol>
    </div>
  );
};

export default Breadcrumbs;
