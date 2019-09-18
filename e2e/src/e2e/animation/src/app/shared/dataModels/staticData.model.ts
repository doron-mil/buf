export class player {

  public id: string;
  public firstName: string;
  public lastName: string;
  public jerseyName: string;
  public teamId: string;
  public roleId: string;
  public number: number;
  public skinTone: string;

  constructor(id?: string, firstName?: string, lastName?: string, jerseyName?: string, teamId?: string, roleId?: string, number?: number, skinTone?: string) {
    this.id = id || '';
    this.firstName = firstName || '';
    this.lastName = lastName || '';
    this.jerseyName = jerseyName || '';
    this.teamId = teamId || '';
    this.roleId = roleId || '';
    this.number = number || 0;
    this.skinTone = skinTone || '';
  }
}


export class team {
  public id: string;
  public name: string;
  public kitHomeId: string;
  public kitAwayId: string;
  public iconPath: string;

  static createEmptyInstance() {
    return new team(null, null, null, null, null);
  }

  constructor(id: string, name: string, kitHomeId: string, kitAwayId: string, iconPath: string) {
    this.id = id || '';
    this.name = name || '';
    this.kitHomeId = kitHomeId || '';
    this.kitAwayId = kitAwayId || '';
    this.iconPath = iconPath || '';
  }
}


export class kit {
  public id: string;
  public name: string;
  public texturePath: string;
  public iconPath: string;

  constructor(id: string, name: string, texturePath: string, iconPath: string) {
    this.id = id || '';
    this.name = name || '';
    this.texturePath = texturePath || '';
    this.iconPath = iconPath || '';
  }
}


export class role {
  public id: string;
  public meshType: string;
  public description: string;

  constructor(id: string, meshType: string, description: string) {
    this.id = id || '';
    this.meshType = meshType || '';
    this.description = description || '';
  }
}


export class skinTone {
  public id: string;
  public texturePath: string;

  constructor(id: string, texturePath: string) {
    this.id = id || '';
    this.texturePath = texturePath || '';
  }
}


export class playerState {
  public id: string;
  public description: string;
  public name: string;
  public keyframeName: number;
  public withBall: boolean;

  constructor(id?: string, description?: string, name?: string, keyframeName?: number, withBall?: boolean) {
    this.id = id || '';
    this.description = description || '';
    this.name = name || '';
    this.keyframeName = keyframeName || 0;
    this.withBall = withBall || false;
  }
}



