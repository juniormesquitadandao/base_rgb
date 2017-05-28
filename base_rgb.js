var encode = function (input) {
  var file = input.files[0];
  var fileReader = new FileReader();
  fileReader.onload = function(event){
    var bytes = new Uint8ClampedArray(event.target.result);
    BaseRGB.encode(bytes, file.name);
  }
  fileReader.readAsArrayBuffer(file);
}

var decode = function (input) {
  var file = input.files[0];
  var fileReader = new FileReader();
  fileReader.onload = function(event){
    var base64 = event.target.result;
    var img = document.createElement('img');
    img.onload = function(){
      BaseRGB.decode(img, file.name);
    };
    img.src = base64;
  }
  fileReader.readAsDataURL(file);
}

var BaseRGB = {
  encode: function(bytes, name){
    var x = Math.trunc(bytes.length / 4);
    var y = Math.sqrt(x);
    var z = Math.trunc(y);
    var rgb_size = bytes.length + bytes.length / 4;
    while(z ** 2 * 4 < rgb_size){
      z += 1;
    }

    var canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = z;
    canvas.height= z;
    var context = canvas.getContext('2d');

    var imageData = context.createImageData(canvas.width, canvas.height);
    var index = 0;
    for(i = 0; index < bytes.length > 0; i+=4){
      imageData.data[i+0] = bytes[index++];
      imageData.data[i+1] = bytes[index++];
      imageData.data[i+2] = bytes[index++];
      imageData.data[i+3] = 255;
    }
    context.putImageData(imageData, 0, 0);

    canvas.toBlob(function(blob) {
      var url  = window.URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.href = url;
      a.download = name + '.png';

      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(event);

      window.URL.revokeObjectURL(url);
    });
  },
  decode: function(img, name){
    var canvas = document.getElementsByTagName('canvas')[1];
    canvas.width = img.width;
    canvas.height= img.height;

    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);

    var imageData = context.getImageData(0, 0, img.width, img.height);
    var blob = new Blob(imageData.data);

    var url  = window.URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = name.replace(/.png$/, '');

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(event);

    window.URL.revokeObjectURL(url);
  }
}
