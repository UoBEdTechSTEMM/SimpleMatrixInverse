/* TwoJS http://jonobr1.github.io/two.js/ */
/* color palette http://paletton.com/#uid=32i0B0kmRuDdfKki--+sHsUtYm0 */

/* Library namespace */
var matrix = matrix || {};

/* Our namespace function */
(function (mt) {
  // Matrix [[a, b], [c, d]]

  mt.Matrix = function (a, b, c, d) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
  }

  mt.IdentityMatrix = function () {
    return new mt.Matrix(1, 0, 0, 1)
  }

  mt.Matrix.prototype.getDeterminant = function () {
    return this.a * this.d - this.b * this.c
  }

  mt.Matrix.prototype.getInverse = function () {
    var det = this.getDeterminant()

    if (det === 0) {
      return { exists: false }
    }

    return { exists: true, matrix: new mt.Matrix(this.d / det, -this.b / det, -this.c / det, this.a / det) }
  }

  mt.Matrix.prototype.add = function (m) {
    return new mt.Matrix(this.a + m.a, this.b + m.b, this.c + m.c, this.d + m.d)
  }

  mt.Matrix.prototype.multiplyScalar = function (scalar) {
    return new mt.Matrix(scalar * this.a, scalar * this.b, scalar * this.c, scalar * this.d)
  }

  mt.Matrix.prototype.multiplyRight = function (m) {
    return new mt.Matrix(this.a * m.a + this.b * m.c, this.a * m.b + this.b * m.d,
                         this.c * m.a + this.d * m.c, this.c * m.b + this.d * m.d)
  }

  mt.Matrix.prototype.multiplyLeft = function (m) {
    return m.multiplyRight(this)
  }

  mt.Matrix.prototype.toString = function () {
    return '[[' + this.a + ', ' + this.b + '], [' + this.c + ', ' + this.d + ']]'
  }

  /* @param{m} matrix to check this is equal to
   * @param{precision} number of sig figs to check to */
  mt.Matrix.prototype.equals = function (m, precision) {
    if (precision === undefined) {
      precision = 3
    }

    return this.a.toPrecision(precision) === m.a.toPrecision(precision) &&
           this.b.toPrecision(precision) === m.b.toPrecision(precision) &&
           this.c.toPrecision(precision) === m.c.toPrecision(precision) &&
           this.d.toPrecision(precision) === m.d.toPrecision(precision)
  }

  mt.Point = function (x, y) {
    this.x = x
    this.y = y
  }

  mt.Point.prototype.applyMatrix = function (m) {
    return new mt.Point(this.x * m.a + this.y * m.b, this.x * m.c + this.y * m.d)
  }

  mt.Point.prototype.toString = function () {
    return '[' + this.a + ', ' + this.b + ']'
  }

  // Grid

  /* @param{rect} rectangle { x, y, width, height } bounding the grid.
   * @params{options} object of the form:
   * var options = {
   *   numTicks,    // number of ticks on each axis. Defaults to 10.
   *   tickSpacing, // { x, y } spacing of ticks in the x, y direction. Defaults
   *                // to { x: rect.width / numTicks, y: rect.height / numTicks }
   *   tickLength,  // length in pixels of the tickmark rendered on the grid. Defaults to 10.
   *   gridlines    // true if you want dashed gridlines on each tick, defaults to true
   * }
   */
  mt.Grid = function (rect, options) {
    this.rect = rect
    this.numTicks = options.numTicks
    this.tickSpacing = options.tickSpacing
    this.tickLength = options.tickLength
    this.gridlines = options.gridlines
    this.center = { x: (this.rect.width / 2) + this.rect.x,
                    y: (this.rect.height / 2) + this.rect.y }

    if (this.numTicks === undefined) {
      this.numTicks = 10
    }
    if (this.tickSpacing === undefined) {
      this.tickSpacing = { x: rect.width / this.numTicks, y: rect.height / this.numTicks }
    }
    if (this.tickLength === undefined) {
      this.tickLength = 10
    }
    if (this.gridlines === undefined) {
      this.gridlines = true
    }
  }

  /* Draw the grid onto the two.js instance */
  mt.Grid.prototype.draw = function (two) {
    var gridX
    var gridY
    var gridlineColor = '#ddd'

    for (var x = 0; x <= this.rect.width / this.tickSpacing.x; x++) {
      // Draw horizontal gridlines
      if (this.gridlines) {
        gridX = two.makeLine(x * this.tickSpacing.x + this.rect.x, this.rect.y,
          x * this.tickSpacing.x + this.rect.x, this.rect.height + this.rect.y)

        gridX.linewidth = 1
        gridX.stroke = gridlineColor
      }

      // Draw horizontal tickmarks
      two.makeLine(x * this.tickSpacing.x + this.rect.x, this.center.y - this.tickLength / 2,
        x * this.tickSpacing.x + this.rect.x, this.center.y + this.tickLength / 2)
    }

    for (var y = 0; y <= this.rect.height / this.tickSpacing.y; y++) {
      // Draw vertical gridlines
      if (this.gridlines) {
        gridY = two.makeLine(this.rect.x, y * this.tickSpacing.y + this.rect.y,
                this.rect.height + this.rect.x, y * this.tickSpacing.y + this.rect.y)

        gridY.linewidth = 1
        gridY.stroke = gridlineColor
      }

      // Draw vertical tickmarks
      two.makeLine(this.center.x - this.tickLength / 2, y * this.tickSpacing.y + this.rect.y,
        this.center.x + this.tickLength / 2, y * this.tickSpacing.y + this.rect.y)
    }

    // Finally, draw the vertical and horizontal axes
    two.makeLine(this.center.x, this.rect.y, this.center.x, this.rect.height + this.rect.y)
    two.makeLine(this.rect.x, this.center.y, this.rect.width + this.rect.x, this.center.y)
  }

  /* Transform right-handed grid coordinates into left-handed, scaled screen coordinates */
  mt.Grid.prototype.gridToScreenCoords = function (point) {
    return new mt.Point(point.x * this.tickSpacing.x + this.center.x,
                       -point.y * this.tickSpacing.y + this.center.y)
  }

  /* Transform array of points from grid to screen coordinates */
  mt.Grid.prototype.scalePoints = function (arrayOfPoints) {
    var scaled = []

    for (var i = 0; i < arrayOfPoints.length; i++) {
      scaled.push(this.gridToScreenCoords(arrayOfPoints[i]))
    }

    return scaled
  }

  mt.drawPath = function (two, vertices, fillColor, strokeColor) {
    // Flatten vertices into a single array of x and y values
    var v = []
    for (var i = 0; i < vertices.length; ++i) {
      v.push(vertices[i].x)
      v.push(vertices[i].y)
    }
    // Finally push the boolean saying we want a closed path
    v.push(false)

    // Pass the arguments as an array, this bit is a bit tricky
    var path = two.makePath.apply(two, v)

    path.fill = fillColor
    path.stroke = strokeColor
    path.linewidth = 2
    path.opacity = 0.5
  }

  // The main application closure
  mt.runApp = function (canvasElem) {
    var two = new Two({ width: 600, height: 600 }).appendTo(canvasElem)

    // Bounding rectangle for the grid
    var pad = 10
    var rect = { x: pad, y: pad, width: two.width - pad * 2, height: two.height - pad * 2 }
    var numTicks = 10

    // Create the grid
    var grid = new mt.Grid(rect, { numTicks: numTicks })

    // Num decimal places to truncate to
    // var decimalPlaces = 3

    // Store both matrices (for swapping them using the swap button)
    var matrix
    var inverseMatrix
    var lastTestedInverseMatrix
    var originalMatrix

    // Current shape to draw
    var currentShape = 'Triangle'

    // Called whenever display is to be updated
    function updateDisplay () {
      var transformedVertices
      var scaledVertices
      var vertices

      // Clear the screen and draw initial stuff
      two.clear()

      // Draw the grid
      grid.draw(two)

      // Draw the untransformed shape
      if (currentShape === 'Triangle') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1)]
      } else if (currentShape === 'Square') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1), new mt.Point(0, 1)]
      }

      // Transform to screen coordinates and draw the untransformed shape
      scaledVertices = grid.scalePoints(vertices)
      mt.drawPath(two, scaledVertices, '#FF9E96', '#F45346')

      transformedVertices = []

      // Apply transformation matrix to each vertex (in grid space)
      for (var i = 0; i < vertices.length; i++) {
        transformedVertices.push(vertices[i].applyMatrix(matrix))
      }

      // Transform to screen coordinates and draw the transformed shape
      scaledVertices = grid.scalePoints(transformedVertices)
      mt.drawPath(two, scaledVertices, '#DAF791', '#A1D916')

      // Update screen
      two.update()
    }

    // Add event handler for shape selection drop-down list
    $('#shapeSelect').change(function () {
      currentShape = $('#shapeSelect option:selected').text()
      updateDisplay()
    })

    // Reset the transformation matrix
    $('#reset').click(function () {
      matrix = originalMatrix
      updateDisplay()
    })

    // Test that the entered inverse is correct
    $('#test').click(function () {
      // Reset to the original transformation matrix
      matrix = originalMatrix

      // Get the matrix elements from page
      var toTest = new mt.Matrix(Number($('#matrixElemA').val()), Number($('#matrixElemB').val()),
        Number($('#matrixElemC').val()), Number($('#matrixElemD').val()))

      console.log(inverseMatrix)

      // Check if the correct matrix was entered
      if (toTest.equals(inverseMatrix, 3) === true) {
        $('#result').text('Correct!')
      } else {
        $('#result').text('Incorrect')
      }

      // Store it
      lastTestedInverseMatrix = toTest
    })

    // Apply inverse as animation, so they can see if it worked
    $('#animate').click(function () {
      var numSteps = 100
      var currentMatrix = mt.IdentityMatrix()
      var transformedVertices = []
      var scaledVertices
      var vertices
      var infinitesimalMatrix = new mt.Matrix((lastTestedInverseMatrix.a - 1) / numSteps,
        lastTestedInverseMatrix.b / numSteps, lastTestedInverseMatrix.c / numSteps, (lastTestedInverseMatrix.d - 1) / numSteps)

      // Generate the untransformed shape
      if (currentShape === 'Triangle') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1)]
      } else if (currentShape === 'Square') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1), new mt.Point(0, 1)]
      }

      // Main update loop
      (function update () {
        // Progress the animation slightly
        currentMatrix = currentMatrix.add(infinitesimalMatrix)

        two.clear()
        grid.draw(two)

        // Transform to screen coordinates and draw the untransformed shape
        scaledVertices = grid.scalePoints(vertices)
        mt.drawPath(two, scaledVertices, '#FF9E96', '#F45346')

        // Apply transformation and then inverse matrix to each vertex (in grid space)
        for (var i = 0; i < vertices.length; i++) {
          transformedVertices.push(vertices[i].applyMatrix(originalMatrix).applyMatrix(currentMatrix))
        }

        // Transform to screen coordinates and draw the transformed shape
        scaledVertices = grid.scalePoints(transformedVertices)
        mt.drawPath(two, scaledVertices, '#DAF791', '#A1D916')

        // Clear all the vertices
        scaledVertices = []
        transformedVertices = []

        // Update screen
        two.update()

        if (currentMatrix.equals(inverseMatrix)) {
          return
        }

        requestAnimationFrame(update)
      })()
    })

    // Generate a matrix to find the inverse of
    $(function () {
      function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min)) + min
      }

      matrix = new mt.Matrix(getRandomInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4))

      // Make sure it has an inverse
      while (matrix.getDeterminant() === 0) {
        matrix = new mt.Matrix(getRandomInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4))
      }

      // Save the original matrix
      originalMatrix = matrix

      $('#toFindInverseOf').append('\\[\\begin{pmatrix} ' + matrix.a +
        '&' + matrix.b + '\\\\' + matrix.c + '&' + matrix.d + '\\end{pmatrix} \\]')

      // Find inverse matrix
      inverseMatrix = matrix.getInverse().matrix

      // Re-render LaTeX
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

      // Draw initial display
      updateDisplay()
      two.update()
    })
  }
})(matrix)
