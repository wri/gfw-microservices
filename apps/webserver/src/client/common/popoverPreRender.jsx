import { Paper, Popover } from 'material-ui';
import PopoverAnimationDefault from 'material-ui/Popover/PopoverAnimationDefault';

Popover.prototype.componentWillMount = function () {
  this.renderLayer = () => {
    const { animated, animation, children, style, targetOrigin, ...other } = this.props;

    let styleRoot = {
      ...style,
      opacity: this.state.setPlacement ? 1 : 0, // MADE EDIT HERE
    };

    if (!animated) {
      styleRoot = {
        position: 'fixed',
        zIndex: this.context.muiTheme.zIndex.popover,
      };

      if (!this.state.open) {
        return null;
      }

      return (
        <div className="popup-window">
          <Paper style={Object.assign(styleRoot, style)} {...other}>
            {children}
          </Paper>
        </div>
      );
    }

    const Animation = animation || PopoverAnimationDefault;

    return (
      <Animation
        targetOrigin={targetOrigin}
        style={styleRoot}
        {...other}
        open={this.state.open && !this.state.closing}
      >
        {children}
      </Animation>
    );
  };
};

Popover.prototype.componentWillReceiveProps = function (nextProps) {
  if (nextProps.open === this.props.open) {
    return;
  }

  if (nextProps.open) {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.anchorEl = nextProps.anchorEl || this.props.anchorEl;
    this.setState(
      {
        open: true,
        closing: false,
        setPlacement: false,
      },
      () => {
        // MADE EDIT HERE
        setTimeout(() => {
          this.setState({
            setPlacement: true,
          });
        });
      }
    );
  } else {
    if (nextProps.animated) {
      if (this.timeout !== null) {
        return;
      }
      this.setState({ closing: true });
      this.timeout = setTimeout(() => {
        this.setState(
          {
            open: false,
          },
          () => {
            this.timeout = null;
          }
        );
      }, 500);
    } else {
      this.setState({
        open: false,
      });
    }
  }
};
