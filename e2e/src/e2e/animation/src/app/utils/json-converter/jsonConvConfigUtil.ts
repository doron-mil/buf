import {ClassMapEntry, MethodMapEntry} from 'angular-json-class-converter';
import {player, team} from '../../shared/dataModels/staticData.model';
import {
  PathKeyframeData,
  PlayerStepAnimation,
  set,
  setBall,
  SetPlayer
} from '../../shared/dataModels/dynamicData.model';

const dateFormat = 'YYYY-MM-DD';

const timeConversion = (timeAsStr: string): number => {
  const timeNumber = 1; // moment.duration(timeAsStr).asMilliseconds();
  return timeNumber;
};

export default {
  functionsMapArray: [
    {methodName: 'timeConversion', method: timeConversion},
  ] as MethodMapEntry[],
  classesMapArray: [
    {className: 'team', clazz: team},
    {className: 'player', clazz: player},
    {className: 'set', clazz: set},
    {className: 'setBall', clazz: setBall},
    {className: 'SetPlayer', clazz: SetPlayer},
    {className: 'PlayerStepAnimation', clazz: PlayerStepAnimation},
    {className: 'PathKeyframeData', clazz: PathKeyframeData},
  ] as ClassMapEntry[],
  conversionSchema:
    [
      {
        className: 'team',
        propertyConversionArray: [
          {
            propertyName: 'id',
          },
          {
            propertyName: 'name',
            propertyNameInJson: 'teamName'
          },
          {
            propertyName: 'kitHomeId',
            propertyNameInJson: 'kitHome'
          },
          {
            propertyName: 'kitAwayId',
            propertyNameInJson: 'kitAway'
          },
          {
            propertyName: 'iconPath',
          },
        ]
      },
      {
        className: 'set',
        propertyConversionArray: [
          {
            propertyName: 'id',
          },
          {
            propertyName: 'name',
          },
          {
            propertyName: 'ball',
            type : 'setBall'
          },
          {
            propertyName: 'yellowLinePosition',
          },
          {
            propertyName: 'leftTeamId',
          },
          {
            propertyName: 'rightTeamId',
          },
          {
            propertyName: 'players',
            type : 'SetPlayer'
          },
        ]
      },
      {
        className: 'SetPlayer',
        propertyConversionArray: [
          {
            propertyName: 'id',
          },
          {
            propertyName: 'kitId',
          },
          {
            propertyName: 'animation',
            type : 'PlayerStepAnimation'
          },
         ]
      },
      {
        className: 'PlayerStepAnimation',
        propertyConversionArray: [
          {
            propertyName: 'startState',
          },
          {
            propertyName: 'endState',
          },
          {
            propertyName: 'pathIndexPosition',
          },
          {
            propertyName: 'paperPath',
          },
          {
            propertyName: 'path',
            type : 'PathKeyframeData'
          },
         ]
      },
      {
        className: 'PathKeyframeData',
        propertyConversionArray: [
          {
            propertyName: 'percentX',
          },
          {
            propertyName: 'percentY',
          },
          {
            propertyName: 'rotation',
          },
         ]
      },
   ]
};
