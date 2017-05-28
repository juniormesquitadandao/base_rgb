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
    var w = Math.ceil(bytes.length / 3);
    var rgb_size = w * 4;
    while(z ** 2 * 4 < rgb_size){
      z += 1;
    }

    var canvas = document.getElementsByTagName('canvas')[0];
    canvas.width = z;
    canvas.height= z;
    var context = canvas.getContext('2d');

    var imageData = context.createImageData(canvas.width, canvas.height);

    var byte_index = 0;
    var image_index = 0;
    for(;byte_index < bytes.length; image_index++){
      var byte = 255;
      if ( (image_index + 1) % 4 != 0 ){
        byte = bytes[byte_index++];
      }
      imageData.data[image_index] = byte;
    }

    imageData.data[imageData.data.length - 1] = image_index;

    for(; (image_index + 1) % 4 != 0; image_index++){
      imageData.data[image_index] = 0;
    }
    imageData.data[image_index] = 255;

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
    console.log(imageData.data, canvas);
    var max = imageData.data[imageData.data.length - 1];
    var bytes = [];
    for(i = 0; i < max; i++){
      if ( (i + 1) % 4 != 0 ){
        bytes.push(imageData.data[i]);
      }
    }

    var uint8ClampedArray = new Uint8ClampedArray(bytes);
    var blob = new Blob([uint8ClampedArray], {type: "octet/stream"});

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
