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

  mt.NullMatrix = function () {
    return new mt.Matrix(0, 0, 0, 0)
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

  /* @param{m} matrix to check this is equal to */
  mt.Matrix.prototype.equals = function (m) {
    return Math.abs(this.a - m.a) < 0.000000001 && Math.abs(this.b - m.b) < 0.000000001 &&
           Math.abs(this.c - m.c) < 0.000000001 && Math.abs(this.d - m.d) < 0.000000001
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

    // Whether or not an animation is playing
    var playing = false

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

    // Test that the entered inverse is correct
    $('#test').click(function () {
      // Reset to the original transformation matrix
      matrix = originalMatrix

      // Get the matrix elements from page
      var toTest = new mt.Matrix(Number($('#matrixElemA').val()), Number($('#matrixElemB').val()),
        Number($('#matrixElemC').val()), Number($('#matrixElemD').val()))

      // Check if the correct matrix was entered
      if (toTest.equals(inverseMatrix) === true) {
        $('#result').text('Correct!')
      } else {
        $('#result').text('Incorrect')
      }

      // Store it
      lastTestedInverseMatrix = toTest

      // Only play animation if it is not currently playing
      if (playing === false) {
        // Test with the animation
        animate(true, animate.bind(this, false))
      }
    })

    // Apply inverse as animation, so they can see if it worked
    function animate (forward, finishCallback) {
      var numSteps = 50
      var currentMatrix = mt.IdentityMatrix()
      var transformedVertices = []
      var scaledVertices
      var vertices
      var inv

      // Set playing flag to true
      playing = true

      if (forward === true) {
        inv = originalMatrix
      } else {
        inv = lastTestedInverseMatrix
      }

      // Generate the untransformed shape
      if (currentShape === 'Triangle') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1)]
      } else if (currentShape === 'Square') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1), new mt.Point(0, 1)]
      }

      // http://math.stackexchange.com/questions/861674/decompose-a-2d-arbitrary-transform-into-only-scaling-and-rotation
      // Variables used in the decomposition
      var E = (inv.a + inv.d) / 2
      var F = (inv.a - inv.d) / 2
      var G = (inv.c + inv.b) / 2
      var H = (inv.c - inv.b) / 2
      var Q = Math.sqrt(Math.pow(E, 2) + Math.pow(H, 2))
      var R = Math.sqrt(Math.pow(F, 2) + Math.pow(G, 2))
      var sx = Q + R
      var sy = Q - R
      var a1 = Math.atan2(G, F)
      var a2 = Math.atan2(H, E)
      var theta = -(a2 - a1) / 2
      var phi = -(a2 + a1) / 2

      // The matrix for each part of the decomposition
      var firstRotation = new mt.Matrix(Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta))
      var scale = new mt.Matrix(sx, 0, 0, sy)
      var secondRotation = new mt.Matrix(Math.cos(phi), Math.sin(phi), -Math.sin(phi), Math.cos(phi))

      var stage = 0 // Which of the above matrices are we transforming?
      var angle = 0 // Angle of the current rotation matrix
      var currScaleX = 1  // Current x scaling of the scaling matrix
      var currScaleY = 1; // Current y scaling of the scaling matrix

      (function update () {
        // Progress the animation slightly
        if (stage === 0) {
          angle += theta / numSteps
          currentMatrix = new mt.Matrix(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle))
        } else if (stage === 1) {
          currScaleX += (sx - 1) / numSteps
          currScaleY += (sy - 1) / numSteps
          currentMatrix = (new mt.Matrix(currScaleX, 0, 0, currScaleY)).multiplyRight(firstRotation)
        } else if (stage === 2) {
          angle += phi / numSteps
          currentMatrix = (new mt.Matrix(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle))).multiplyRight(scale).multiplyRight(firstRotation)
        }

        two.clear()
        grid.draw(two)

        // Transform to screen coordinates and draw the untransformed shape
        scaledVertices = grid.scalePoints(vertices)
        mt.drawPath(two, scaledVertices, '#FF9E96', '#F45346')

        // Apply transformation and then inverse matrix to each vertex (in grid space)
        for (var i = 0; i < vertices.length; i++) {
          if (forward === true) {
            transformedVertices.push(vertices[i].applyMatrix(currentMatrix))
          } else {
            transformedVertices.push(vertices[i].applyMatrix(originalMatrix).applyMatrix(currentMatrix))
          }
        }

        // Transform to screen coordinates and draw the transformed shape
        scaledVertices = grid.scalePoints(transformedVertices)

        if (forward === true) {
          mt.drawPath(two, scaledVertices, '#DAF791', '#A1D916')
        } else {
          mt.drawPath(two, scaledVertices, '#A983D4', '#571B9C')
        }

        // Clear all the vertices
        scaledVertices = []
        transformedVertices = []

        // Update screen
        two.update()

        // Check if we are at the end of an animation stage
        if (stage === 0 && currentMatrix.equals(firstRotation)) {
          stage++
          currentMatrix = mt.IdentityMatrix()
        } else if (stage === 1 && currentMatrix.equals(scale.multiplyRight(firstRotation))) {
          stage++
          currentMatrix = mt.IdentityMatrix()
          angle = 0
        } else if (stage === 2 && currentMatrix.equals(secondRotation.multiplyRight(scale.multiplyRight(firstRotation)))) {
          if (finishCallback !== undefined) {
            // Pause, then start next animation
            setTimeout(finishCallback, 2000)
          } else {
            // If there is no further callback, stop playing
            playing = false
          }
          return
        }

        requestAnimationFrame(update)
      })()
    }

    $('#debugInverse').click(function () {
      $('#matrixElemA').val(inverseMatrix.a)
      $('#matrixElemB').val(inverseMatrix.b)
      $('#matrixElemC').val(inverseMatrix.c)
      $('#matrixElemD').val(inverseMatrix.d)

      updateResultingMatrix()
    })

    // Update resulting matrix by applying inverse to the transformation matrix
    function updateResultingMatrix () {
      var res
      var toTest = new mt.Matrix(Number($('#matrixElemA').val()), Number($('#matrixElemB').val()),
        Number($('#matrixElemC').val()), Number($('#matrixElemD').val()))

      if (isNaN(toTest.a) || isNaN(toTest.b) || isNaN(toTest.c) || isNaN(toTest.d)) {
        return
      }

      res = originalMatrix.multiplyRight(toTest)

      // Round values to 2 decimal places
      res.a = Math.round(res.a * 100) / 100
      res.b = Math.round(res.b * 100) / 100
      res.c = Math.round(res.c * 100) / 100
      res.d = Math.round(res.d * 100) / 100

      // Update resulting matrix display
      $('#resultingMatrix').text('\\(= \\begin{pmatrix} ' + res.a + ' & ' + res.b +
        ' \\\\ ' + res.c + ' & ' + res.d + ' \\end{pmatrix} \\)')

      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
    }

    // Add event handler to update resulting matrix
    $('#matrixElemA').on('input', updateResultingMatrix)
    $('#matrixElemB').on('input', updateResultingMatrix)
    $('#matrixElemC').on('input', updateResultingMatrix)
    $('#matrixElemD').on('input', updateResultingMatrix)

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

      $('#toFindInverseOf').append('\\(\\begin{pmatrix} ' + matrix.a +
        '&' + matrix.b + '\\\\' + matrix.c + '&' + matrix.d + '\\end{pmatrix}\\)')

      // Find inverse matrix
      inverseMatrix = matrix.getInverse().matrix
      lastTestedInverseMatrix = mt.NullMatrix()

      // Truncate correct inverse to 3 sig figs
      inverseMatrix = new mt.Matrix(inverseMatrix.a.toPrecision(3), inverseMatrix.b.toPrecision(3),
        inverseMatrix.c.toPrecision(3), inverseMatrix.d.toPrecision(3))

      // Display (currently) null resulting matrix
      $('#resultingMatrix').text('\\(= \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix} \\)')

      // Re-render LaTeX
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

      // Draw initial display
      updateDisplay()
      two.update()
    })
  }
})(matrix)
