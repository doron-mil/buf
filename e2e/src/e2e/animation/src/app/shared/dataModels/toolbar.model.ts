export class PlaySet {
  id: number;
  name: string;
}

export class AnimationPath {
  playerId: string;
  path: Coords[];


  constructor(playerId: string, path: Coords[]) {
    this.playerId = playerId;
    this.path = path;
  }
}

export class Coords {
  x: number;
  y: number;

  static create(aX: number, aY: number) {
    const newCoord = new Coords();
    newCoord.x = aX;
    newCoord.y = aY;
    return newCoord;
  }

  subtractCoords(aSubtractor: Coords) {
    this.x -= aSubtractor.x;
    this.y -= aSubtractor.y;
  }

  values(): number[] {
    return [this.x, this.y];
  }

  clone(): Coords {
    const newCoords = new Coords();
    newCoords.x = this.x;
    newCoords.y = this.y;
    return newCoords;
  }
}
