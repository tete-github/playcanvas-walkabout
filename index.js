/* global pc */
var message = function(msg) {
  var el = document.querySelector(".message");
  el.textContent = msg;
};

var canvas = document.getElementById("application-canvas");
var app = new pc.Application(canvas, {
  mouse: new pc.Mouse(canvas)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

// use device pixel ratio
app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;

app.start();

var cameraParent = new pc.Entity();
app.root.addChild(cameraParent);

// create camera
var c = new pc.Entity();
c.addComponent("camera", {
  clearColor: new pc.Color(44 / 255, 62 / 255, 80 / 255),
  farClip: 10000
});
cameraParent.addChild(c);

var l = new pc.Entity();

l.addComponent("light", {
  type: "spot",
  range: 30
});
l.translate(0, 10, 0);
app.root.addChild(l);

var cubes = [];

var createCube = function(x, y, z) {
  var cube = new pc.Entity();
  cube.addComponent("model", {
    type: "box",
    material: new pc.StandardMaterial()
  });
  cube.setLocalScale(1, 1, 1);
  cube.translate(x, y, z);
  app.root.addChild(cube);
  cubes.push(cube);
};

// create a grid of cubes
var SIZE = 4;
for (var x = 0; x <= SIZE; x++) {
  for (var y = 0; y <= SIZE; y++) {
    createCube(2 * x - SIZE, -1.5, 2 * y - SIZE);
  }
}

if (app.xr.supported) {
  var activate = function() {
    if (app.xr.isAvailable(pc.XRTYPE_VR)) {
      c.camera.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCAL, {
        callback: function(err) {
          if (err) message("Immersive VR failed to start: " + err.message);
        }
      });
    } else {
      message("Immersive VR is not available");
    }
  };

  app.mouse.on("mousedown", function() {
    if (!app.xr.active) activate();
  });

  message("Tap on screen to enter VR");

  var cameraPosition = new pc.Vec3();
  var newAngle = 0;
  var oldAngle = 0;
  var rotationTrigger = 0;

  app.xr.input.on("squeezestart", function() {
    rotationTrigger = 1;
    oldAngle = Math.atan2(c.forward.x, c.forward.z);
  });

  app.on("update", function() {
    if (rotationTrigger == 1) {
      cameraPosition.copy(c.getLocalPosition());
      newAngle = Math.atan2(c.forward.x, c.forward.z);
      let delta = pc.math.RAD_TO_DEG * (oldAngle - newAngle);

      cameraParent.translateLocal( cameraPosition );
      cameraParent.rotateLocal(0, delta, 0);
      cameraParent.translateLocal( cameraPosition.scale(-1) );

      oldAngle = Math.atan2(c.forward.x, c.forward.z);
    }
  });

  app.xr.input.on("squeezeend", function() {
    rotationTrigger = 0;
  });
} else {
  message("WebXR is not supported");
}
