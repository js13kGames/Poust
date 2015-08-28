﻿module Poust {

    export class Engine {

        private _state: IState;
        private _stateListener: IStateListener;

        public constructor(private _stateFactory: IStateFactory) {
            this._stateListener = (source: IState, param: any) => {
                if (source == this._state) {
                    this.setStateFromParam(param);
                }
            };
        }

        public setStateFromParam(param : any) {
            var state = this._stateFactory(param);
            this.setState(state);
        }

        public setState(state: IState) {
            if (this._state) {
                this._state.setStateListener(null);
                this._state.stop();
                this._state.destroy();
            }
            this._state = state;
            if (state) {
                state.setStateListener(this._stateListener);
                state.init();
                state.start();
            }
        }

    }

}