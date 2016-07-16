var loadBirdie = function(){
  var birdie,
      theBird,
      canvas;

  function flap() {

      window.requestAnimationFrame(flap);

      birdie.update();
      birdie.render();
  }

  function sprite(options) {

      var that = {},
          frameIndex = 0,
          tickCount = 0,
          ticksPerFrame = options.ticksPerFrame || 0,
          numberOfFrames = options.numberOfFrames || 1;

      that.context = options.context;
      that.width = options.width;
      that.height = options.height;
      that.image = options.image;

      that.update = function () {

          tickCount += 1;

          if (tickCount > ticksPerFrame) {

              tickCount = 0;

              // If the current frame index is in range
              if (frameIndex < numberOfFrames - 1) {
                  // Go to the next frame
                  frameIndex += 1;
              } else {
                  frameIndex = 0;
              }
          }
      };

      that.render = function () {

          // Clear the canvas
          that.context.clearRect(0, 0, that.width, that.height);

          // Draw the animation
          that.context.drawImage(
              that.image,
              frameIndex * that.width / numberOfFrames,
              0,
              that.width / numberOfFrames,
              that.height,
              0,
              0,
              that.width / numberOfFrames,
              that.height);
      };

      return that;
  }

  // Get canvas
  canvas = document.getElementById("loader");
  canvas.width = 308;
  canvas.height = 341;

  // Create sprite sheet
  theBird = new Image();

  // Create sprite
  birdie = sprite({
      context: canvas.getContext("2d"),
      width: 615,
      height: 341,
      image: theBird,
      numberOfFrames: 2,
      ticksPerFrame: 15
  });

  // Load sprite sheet
  theBird.addEventListener("load", flap);
  theBird.src = "./img/birdie.png";

};
