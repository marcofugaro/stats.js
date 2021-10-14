
class Panel {

  constructor( name, fg, bg, showMinMax = true) {

    let min = Infinity;
    let max = 0;
    const round = Math.round;
    const PR = round( window.devicePixelRatio || 1 );

    const WIDTH = 80 * PR, HEIGHT = 48 * PR,
        TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
        GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
        GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

    const canvas = document.createElement( 'canvas' );
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';
    this.dom = canvas;

    const context = canvas.getContext( '2d' );
    context.font = `bold ${ 9 * PR }px Helvetica,Arial,sans-serif`;
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect( 0, 0, WIDTH, HEIGHT );

    context.fillStyle = fg;
    context.fillText( name, TEXT_X, TEXT_Y );
    context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );



    this.update = ( value, maxValue ) => {

      min = Math.min( min, value );
      max = Math.max( max, value );

      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect( 0, 0, WIDTH, GRAPH_Y );
      context.fillStyle = fg;

      const letters = Math.max(2, value.length) // clamp them so they don't jump around
			context.textAlign = 'right';
			context.fillText(`${round( value )}`, TEXT_X + letters * 5 * PR, TEXT_Y );
			context.textAlign = 'left';
			const minMax = `(${round( min )}-${round( max )})`;
      context.fillText(`${name} ${showMinMax ? minMax : ''}`, TEXT_X + (letters * 5 + 2) * PR, TEXT_Y );

      context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

      context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

    }
  }

};

export default Panel