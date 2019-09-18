export class playerFieldData {
    public id:string;
    public x:number;
    public y:number;
    public rotation:number;

    constructor(id:string, x:number, y:number, rotation:number){
        this.id = id || '';
        this.x = x || 0;
        this.y = y || 0;
        this.rotation = rotation || 0;
    }
}


export class FieldData {
    public width:number;
    public height:number;
    public playerScale:number;
    public rotation:number;
    public fieldScale:number;

    constructor(width:number, height:number, playerScale:number, rotation:number, fieldScale:number){
        this.width = width || 0;
        this.height = height || 0;
        this. playerScale = playerScale || 1;
        this.rotation = rotation || 0;
        this.fieldScale = fieldScale || 1;
    }
}


export class socketconfig {
    public host:string;
    public port:number;
    public engineHost:string;
    public enginePort:number;
}


export class animationStatus {
    public currentStep:number;
    public currentFrame:number;

    constructor(currentStep:number, currentFrame:number){
        this.currentStep = currentStep || 0;
        this.currentFrame = currentFrame || 0;
    }
}
