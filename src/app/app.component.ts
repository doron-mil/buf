import {AfterViewInit, Component, OnInit} from '@angular/core';
import {fabric} from 'fabric';
import {IObjectAnimation, Rect} from 'fabric/fabric-impl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  canvas: any;

  ngOnInit() {
    this.canvas = new fabric.Canvas('myCanvas');
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight);

    this.canvas.add(new fabric.IText('Hello World !'));
  }

  ngAfterViewInit() {
    const rect: Rect = new fabric.Rect({
      top: 100,
      left: 100,
      width: 60,
      height: 70,
      fill: 'yellow',
      borderColor: 'black',
      hasBorders: true,
      padding: 5,
      stroke: 'black',
      strokeWidth: 10,
      strokeLineJoin: 'round',
      angle: 30,
      selectable: false
    });

    const circle = new fabric.Circle({
      radius: 60, left: 200, top: 150, hasBorders: true,
      selectable: true
    });


    circle.setGradient('fill', {
      // @ts-ignore
      x1: 0,
      y1: 0,
      x2: circle.height,
      y2: circle.height
      ,
      colorStops: {
        0: 'red',
        0.2: 'orange',
        0.4: 'yellow',
        0.6: 'green',
        0.8: 'blue',
        1: 'purple'
      }
    });

    fabric.Image.fromURL('/assets/gong.png', ((oImg) => {
      oImg.set('top', 300);
      oImg.set('left', 300);
      oImg.set('width', 512);
      oImg.set('height', 512);
      oImg.scale(0.2);

      oImg.filters.push(new fabric.Image.filters.Grayscale());
      // oImg.filters.push(new fabric.Image.filters.Sepia());
      oImg.applyFilters();

      this.canvas.add(oImg);
    }).bind(this));

    const imgElement = document.getElementById('my-image');
    const imgInstance = new fabric.Image(imgElement as HTMLImageElement, {
      left: 500,
      top: 150,
      width: 2360,
      height: 2370,
      // angle: 30,
      scaleX: 0.1,
      scaleY: 0.05,
      opacity: 0.85
    });

    const he = fabric.loadSVGFromURL('/assets/he.svg', ((oImg) => {
      // oImg.scale(0.2);
      console.log('1111');
      // oImg.set('top', 300);
      // oImg.set('left', 800);
      // oImg.set('width', 512);
      // oImg.set('height', 512);
      // this.canvas.add(oImg);
    }).bind(this));

    const path = new fabric.Path('M 0 0 L 200 100  L 50 50 L 170 200 z');
    path.set({left: 720, top: 120});

    this.canvas.add(circle);
    this.canvas.add(rect);
    this.canvas.add(imgInstance);
    this.canvas.add(path);

    // this.canvas.add(he);
    (rect as IObjectAnimation<Rect>).animate('angle', '-=180', {
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 3000,
      easing: fabric.util.ease.easeOutBounce
    });

    this.canvas.on('object:modified', (options) => {
      if (options.target) {
        console.log('an object was clicked! ', options);
      }
    });
  }
}
