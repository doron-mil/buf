import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {MatIconRegistry} from '@angular/material';

import {DevToolsExtension, NgRedux, NgReduxModule} from '@angular-redux/store';
import {applyMiddleware, combineReducers, createStore, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

import {AngularJsonClassConverterModule, JsonConverterConfigurationInterface} from 'angular-json-class-converter';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {default as jsonConvConfigUtil} from './utils/json-converter/jsonConvConfigUtil';
import {DataService} from './shared/services/data.service';
import {GeneralMiddlewareService} from './store/middleware/feature/general.mid';
import {ApiMiddlewareService} from './store/middleware/core/api.mid';
import {StoreDataTypeEnum} from './store/storeDataTypeEnum';
import {generalReducer} from './store/reducers/general.reducer';
import {staticDataReducer} from './store/reducers/static.data.reducer';
import {dynamicDataReducer} from './store/reducers/dynamic.data.reducer';
import {innerReducer} from './store/reducers/inner.data.reducer';
import {AdminModule} from './modules/admin/admin.module';
import {HomeModule} from './modules/home/home.module';

const jsonConverterConfig: JsonConverterConfigurationInterface = {
  conversionSchema: jsonConvConfigUtil.conversionSchema,
  conversionFunctionsMapArray: jsonConvConfigUtil.functionsMapArray,
  classesMapArray: jsonConvConfigUtil.classesMapArray
};

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // MocukpModule,
    NgReduxModule,
    AngularJsonClassConverterModule.forRoot(jsonConverterConfig),
    HomeModule,
    AdminModule,
  ],
  providers: [DataService, ApiMiddlewareService, GeneralMiddlewareService],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private ngRedux: NgRedux<any>,
              private devTools: DevToolsExtension,
              matIconRegistry: MatIconRegistry,
              generalMiddlewareService: GeneralMiddlewareService,
              apiMiddlewareService: ApiMiddlewareService,) {
    // ***********************************************
    // ************* Redux Init **********************
    // ***********************************************

    // ************* Middleware **********************
    // ***********************************************
    const featureMiddleware = [
      generalMiddlewareService.generalMiddleware,
    ];

    const coreMiddleware = [
      apiMiddlewareService.apiMiddleware,
    ];

    // ************* Reducers   **********************
    // ***********************************************
    const rootReducer = combineReducers({
      [StoreDataTypeEnum.GENERAL]: generalReducer,
      [StoreDataTypeEnum.STATIC_DATA]: staticDataReducer,
      [StoreDataTypeEnum.DYNAMIC_DATA]: dynamicDataReducer,
      [StoreDataTypeEnum.INNER_DATA]: innerReducer,
    });

    // ************* Store Creation ******************
    // ***********************************************
    const store: Store = createStore(
      rootReducer,
      composeWithDevTools(
        applyMiddleware(...featureMiddleware, ...coreMiddleware)
      )
    );

    ngRedux.provideStore(store);

  }
}
