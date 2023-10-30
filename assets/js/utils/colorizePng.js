     
import images from 'c9-images';

export default function colorize(src, { color }){

  let tempImage = (/base64/.test(src)) ? src : images[src];
  if (typeof tempImage === 'undefined') {
    return new Promise((resolve, reject) => {
      resolve();
    });
    
  } else {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = images[src]
  
      image.onload = colorMasterImage;
      image.addEventListener('error', (err) => reject(err));
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      function colorMasterImage(){
  
        const masterWidth = image.width;
        const masterHeight = image.height;
  
        //set canvas size
        canvas.width = masterWidth;
        canvas.height = masterHeight;
  
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height)
  
        console.log(canvas.width)
        console.log(canvas.height)
    
        context.globalCompositeOperation = "destination-in";
  
        context.drawImage(this, 0, 0);
  
        images[src] = canvas.toDataURL()
  
        resolve();
      }
    })
  }
}