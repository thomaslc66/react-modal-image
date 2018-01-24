import React, { Component } from "react";

import * as style from "./styles";

import {
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  CloseIcon,
  SpinnerIcon
} from "./icons";

export default class extends Component {
  state = {
    mediumImgLoading: true,
    largeImgLoading: true,
    move: { x: 0, y: 0 },
    moveStart: undefined,
    zoomed: false
  };

  mediumLoaded = () => {
    this.setState({ mediumImgLoading: false });
  };

  largeLoaded = () => {
    this.setState({ largeImgLoading: false });
  };

  handleKeyDown = event => {
    // ESC or ENTER closes the modal
    if (event.keyCode === 27 || event.keyCode === 13) {
      this.props.onClose();
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  getCoordinatesIfOverImg = event => {
    const point = event.changedTouches ? event.changedTouches[0] : event;

    if (point.target.id !== "react-modal-image-img") {
      // the img was not a target of the coordinates
      return;
    }

    const dim = this.contentEl.getBoundingClientRect();
    const x = point.clientX - dim.left;
    const y = point.clientY - dim.top;

    return { x, y };
  };

  handleMouseDownOrTouchStart = event => {
    event.preventDefault();

    if (event.touches && event.touches.length > 1) {
      // more than one finger, ignored
      return;
    }

    const coords = this.getCoordinatesIfOverImg(event);

    if (!coords) {
      // click outside the img => close modal
      this.props.onClose();
    }

    if (!this.state.zoomed) {
      // do not allow drag'n'drop if zoom has not been applied
      return;
    }

    this.setState(prevState => {
      return {
        moveStart: {
          x: coords.x - prevState.move.x,
          y: coords.y - prevState.move.y
        }
      };
    });
  };

  handleMouseMoveOrTouchMove = event => {
    event.preventDefault();

    if (!this.state.zoomed) {
      // do not allow drag'n'drop if zoom has not been applied
      return;
    }

    if (event.touches && event.touches.length > 1) {
      // more than one finger, ignored
      return;
    }

    const coords = this.getCoordinatesIfOverImg(event);

    if (!coords) {
      return;
    }

    this.setState(prevState => {
      if (!prevState.moveStart) {
        return;
      }

      return {
        move: {
          x: coords.x - prevState.moveStart.x,
          y: coords.y - prevState.moveStart.y
        }
      };
    });
  };

  handleMouseUpOrTouchEnd = event => {
    this.setState({
      moveStart: undefined
    });
  };

  toggleZoom = event => {
    event.preventDefault();
    this.setState(prevState => ({
      zoomed: !prevState.zoomed,
      // reset position if zoomed out
      move: prevState.zoomed ? { x: 0, y: 0 } : prevState.move
    }));
  };

  render() {
    const { medium, large, alt, onClose } = this.props;

    const { mediumImgLoading, largeImgLoading, move, zoomed } = this.state;

    return (
      <div style={style.modal}>
        <div
          onMouseDown={this.handleMouseDownOrTouchStart}
          onMouseUp={this.handleMouseUpOrTouchEnd}
          onMouseMove={this.handleMouseMoveOrTouchMove}
          onTouchStart={this.handleMouseDownOrTouchStart}
          onTouchEnd={this.handleMouseUpOrTouchEnd}
          onTouchMove={this.handleMouseMoveOrTouchMove}
          onDoubleClick={this.toggleZoom}
          ref={el => {
            this.contentEl = el;
          }}
          style={style.modalContent}
        >
          {!zoomed && (
            <div>
              {mediumImgLoading && (
                <div style={style.spinner}>
                  <SpinnerIcon />
                </div>
              )}
              <img
                onContextMenu={event => {
                  event.preventDefault();
                }}
                id="react-modal-image-img"
                style={style.mediumImage}
                src={medium}
                onLoad={this.mediumLoaded}
              />
            </div>
          )}
          {zoomed && (
            <div>
              {largeImgLoading && (
                <div style={style.spinner}>
                  <SpinnerIcon />
                </div>
              )}
              <img
                id="react-modal-image-img"
                style={style.largeImage(move.x, move.y)}
                src={large}
                onLoad={this.largeLoaded}
              />
            </div>
          )}
        </div>
        <div style={style.header}>
          <span style={style.iconMenu}>
            <a href={large} style={style.icon} download>
              <DownloadIcon />
            </a>
            <a href="" style={style.icon} onClick={this.toggleZoom}>
              {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
            </a>
            <a style={style.icon} onClick={onClose}>
              <CloseIcon />
            </a>
          </span>
          <span style={style.caption}>{alt}</span>
        </div>
      </div>
    );
  }
}
