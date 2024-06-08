import React, { Component } from 'react';
/**
 * Error Boundary HOC
 * Returns a component type to isolate errors from its child down.
 * @returns {ComponentType} React Component Type
 */
const CatchContainer = (ErrorComponent, errorHandler) =>
  /** Returning a Class Component for this feature */
  class ErrorBoundaryClassComponent extends Component {
    constructor(props) {
      super(props);

      this.state = {
        error: undefined,
      };
    }

    static getDerivedStateFromError(error) {
      return { error };
    }

    componentDidCatch(error) {
      if (errorHandler) {
        errorHandler(error);
      }
    }

    render() {
      return <ErrorComponent {...this.props} error={this.state.error} />;
    }
  };

export default CatchContainer;
