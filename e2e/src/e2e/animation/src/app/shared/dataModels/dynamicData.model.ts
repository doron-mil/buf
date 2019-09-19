export class set {

  public id: string;
  public name: string;
  public ball: setBall;
  public yellowLinePosition: number;
  public leftTeamId: string;
  public rightTeamId: string;
  public players: SetPlayer[];

  constructor(id?: string, name?: string, ball?: setBall, yellowLinePosition?: number, leftTeamId?: string, rightTeamId?: string, players?: SetPlayer[]) {
    this.id = id || '';
    this.name = name || '';
    this.ball = ball || new setBall(false);
    this.yellowLinePosition = yellowLinePosition || 0;
    this.leftTeamId = leftTeamId || '';
    this.rightTeamId = rightTeamId || '';
    this.players = players || [];
  }
}

export class setBall {
  public active: boolean;

  constructor(active?: boolean) {
    this.active = active || false;
  }
}

export class SetPlayer {

  public id: string;
  public kitId: string;
  public animation: PlayerStepAnimation[];

  constructor(id: string, kitId: string, animation: PlayerStepAnimation[]) {
    this.id = id || '';
    this.kitId = kitId || '';
    this.animation = animation || [new PlayerStepAnimation(null, null, null)];
  }

}

export class SetPlayerSimple {
  id: string;
  jerseyName: string;
  number: number;
  kitId: string;
  x = 0;
  y = 0;
  rotation = 0;
}


export class PlayerStepAnimation {

  public startState: playerCurrentState;
  public endState: playerCurrentState;
  public path: PathKeyframeData[];
  public paperPath: string;
  public pathIndexPosition: number;

  constructor(startState: playerCurrentState, endState: playerCurrentState, path: PathKeyframeData[]) {
    if (startState) {
      this.startState = startState;
    }
    if (endState) {
      this.endState = endState;
    }
    this.path = path || [new PathKeyframeData(0, 0, 0, null)];
    this.pathIndexPosition = 0;
  }

  static createInstance(): PlayerStepAnimation {
    return new PlayerStepAnimation(null, null, null);
  }

  public addPosition(x: number, y: number, rotation: number, currentState: playerCurrentState) {
    this.path.push(new PathKeyframeData(x, y, rotation, currentState));
  }

}


export class PathKeyframeData {

  // public absoluteX:number;
  // public absoluteY:number;
  public percentX: number;
  public percentY: number;
  public rotation: number;
  public currentState: playerCurrentState;

  constructor(percentX: number, percentY: number, rotation: number, currentState: playerCurrentState) {
    // this.absoluteX=absoluteX || 0;
    // this.absoluteY=absoluteY || 0;
    this.percentX = percentX || 0;
    this.percentY = percentY || 0;
    this.rotation = rotation || 0;
    this.currentState = currentState || new playerCurrentState('', '');
  }
}

export class playerCurrentState {

  public stateId: string;
  public secondPlayer: string;

  constructor(stateId: string, secondPlayer: string) {
    this.stateId = stateId || '';
    this.secondPlayer = secondPlayer || '';
  }
}


export class playerExtraData {
  public jerseyName: string;
  public number: number;
  public teamColorPath: string;

  constructor(jerseyName: string, number: number, teamColorPath: string) {
    this.jerseyName = jerseyName || '';
    this.number = number || 0;
    this.teamColorPath = teamColorPath || '';
  }
}

