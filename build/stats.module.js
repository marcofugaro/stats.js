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

      const letters = Math.max(2, value.length); // clamp them so they don't jump around
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

    };
  }

}

/**
 * @author mrdoob / http://mrdoob.com/
 */

class Stats {

	constructor({ showMinMax = true, context } = {}) {
		this.mode = 0;
		this.beginTime = performance.now();
		this.prevTime = this.beginTime;
		this.frames = 0;

		this.REVISION = 16;

		const container = document.createElement( 'div' );
		container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
		container.addEventListener( 'click', ( event ) => {

			event.preventDefault();
			this.showPanel( ++ this.mode % container.children.length );

		} );
		this.dom = container;

		this.fpsPanel = this.addPanel( new Panel( 'FPS', '#0ff', '#002', showMinMax ) );
		this.msPanel = this.addPanel( new Panel( 'MS', '#0f0', '#020', showMinMax ) );

		if ( performance && performance.memory ) {

			this.memPanel = this.addPanel( new Panel( 'MB', '#f08', '#201', showMinMax ) );

		}

		this.queryExtension = context && context.getExtension('EXT_disjoint_timer_query_webgl2');
		if ( this.queryExtension ) {

			this.gpuPanel = this.addPanel( new Panel( 'MS GPU', '#f90', '#210', showMinMax ) );

			this.context = context;

		}


		this.showPanel( 0 );

	}


	addPanel( panel ) {

		this.dom.appendChild( panel.dom );
		return panel;

	}

	showPanel( id ) {

		for ( var i = 0; i < this.dom.children.length; i ++ ) {

			this.dom.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		this.mode = id;

	}


	begin() {

		this.beginTime = performance.now();

		if ( this.gpuPanel ) {

			// Setup
			this.queryCreated = false;
			let queryResultAvailable = false;

			// Test if query result available
			if ( this.query ) {

				queryResultAvailable = this.context.getQueryParameter(this.query, this.context.QUERY_RESULT_AVAILABLE);

				if ( queryResultAvailable ) {

					const maxValue = 30;
					const ns = this.context.getQueryParameter(this.query, this.context.QUERY_RESULT);
					const panelValue = Math.min(ns / 1000 / 1000, maxValue);

					this.gpuPanel.update(panelValue, maxValue);

				}
			}

			// If query result available or no query yet
			if ( queryResultAvailable || !this.query ) {

					// Create new query
					this.queryCreated = true;
					this.query = this.context.createQuery();
					this.context.beginQuery(this.queryExtension.TIME_ELAPSED_EXT, this.query);

			}

		}
	}

	end() {

		this.frames ++;

		const time = performance.now();

		this.msPanel.update( time - this.beginTime, 200 );

		if ( time >= this.prevTime + 1000 ) {

			this.fpsPanel.update( ( this.frames * 1000 ) / ( time - this.prevTime ), 100 );

			this.prevTime = time;
			this.frames = 0;

			if ( this.memPanel ) {

				const memory = performance.memory;
				this.memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

			}

		}

		// End the query (result will be available "later")
		if ( this.queryCreated ) {

				this.context.endQuery(this.queryExtension.TIME_ELAPSED_EXT);

		}

		return time;

	}

	update() {

		this.beginTime = this.end();

	}

}

export default Stats;
export { Panel };
