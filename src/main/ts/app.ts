﻿var w = window;

w.onload = () => {

    var levelStateElement = document.getElementById("c");
    var menuStateElement = document.getElementById("m");

    var audioContext: AudioContext;
    if (w["AudioContext"]) {
        audioContext = new AudioContext();
    } else if (w["webkitAudioContext"]) {
        audioContext = new webkitAudioContext();
    }

    var sawtooth = 'sawtooth';
    var square = 'square';

    var jumpSound = webAudioToneSoundFactory(audioContext, sawtooth, 250, 1000, 400, 0.01, 0.08, 0.12, 0.3);
    var shootSound1 = webAudioToneSoundFactory(audioContext, square, 600, 100, 100, 0, 0.035, 0.04, 0.2, 0.6);
    var shootSound = webAudioGunSoundFactory(audioContext, shootSound1);
    var playerDeathSound = webAudioVibratoSoundFactory(audioContext, 200, 10, 6, 0.7);
    var wallJumpAvailableSound = webAudioToneSoundFactory(audioContext, square, 250, -150, 100, 0, 0.05, 0.1, 0.2, 0.5);
    var monsterDeathSound = webAudioToneSoundFactory(audioContext, sawtooth, 300, -100, 100, 0.01, 0.05, 0.1, 0.3);
    var winSound = webAudioVibratoSoundFactory(audioContext, 600, 1000, 14, 0.8);

    var canvas = <HTMLCanvasElement>levelStateElement;
    var context = canvas.getContext("2d");

    var rgba = function (r, g, b, a) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    };

    var f = function (g: CanvasGradient, alpha: number) {
        g.addColorStop(0, rgba(0, 0, 0, alpha));
        g.addColorStop(0.2, rgba(255, 0, 255, alpha));
        g.addColorStop(0.32, rgba(255, 0, 0, alpha));
        g.addColorStop(0.44, rgba(255, 255, 0, alpha));
        g.addColorStop(0.56, rgba(0, 255, 0, alpha ));
        g.addColorStop(0.68, rgba(0, 255, 255,  alpha ));
        g.addColorStop(0.8, rgba(0, 0, 255, alpha));
        g.addColorStop(0.92, rgba(255, 255, 255, 0.7));
        g.addColorStop(1, rgba(255, 255, 255, 0));
    };
    var radialGradient = context.createRadialGradient(0, 0, 0, 0, 0, 1500);
    f(radialGradient, 0.5);

    var enemyGradient = context.createRadialGradient(0, 0, 200, 0, 0, 1700);
    f(enemyGradient, 0.75);
    
    var white = "#FFF";
    var defaultRenderer = pathEntityRendererFactory(2, white, radialGradient);
    var flappyRenderer = flappyEntityRendererFactory(2, white, enemyGradient);
    var spikeRenderer = spikeEntityRendererFactory(2, white, rgba(255, 255, 255, 0.8));
    var bouncyRenderer = bouncyEntityRendererFactory(2, white, enemyGradient);
    var seekerRenderer = seekerEntityRendererFactory(2, white, enemyGradient);
    var exitRenderer = exitEntityRendererFactory(2, white, enemyGradient);
    var playerRenderer = playerEntityRendererFactory(2, white, rgba(255, 0, 0, 1), rgba(208, 192, 0, 1));
    var bulletRenderer = seekerEntityRendererFactory(2, "#FFA", rgba(255, 255, 0, 0.7));
    var chomperRenderer = chomperEntityRendererFactory(2, white, enemyGradient);
    var entityRendererFactory = hardCodedEntityRendererFactory(defaultRenderer, spikeRenderer, flappyRenderer, bouncyRenderer, seekerRenderer, exitRenderer, playerRenderer, bulletRenderer, chomperRenderer);

    var level1 = "1";
    var level2 = "2";
    var level3 = "3";
    var level4 = "4";

    var gravity = 0.0014;
    var maxCollisionSteps = 6;

    var entitySpawnerFactory = hardCodedEntitySpawnerFactory(monsterDeathSound);

    var rngFactory = sinRandomNumberGeneratorFactory();

    //var _concentricLevelStateFactory = concentricLevelStateFactory(levelStateElement, context, gravity, entityRendererFactory, maxCollisionSteps, rngFactory, entitySpawnerFactory);
    var _gridLevelStateFactory = gridLevelStateFactory(levelStateElement, context, gravity, entityRendererFactory, maxCollisionSteps, rngFactory, entitySpawnerFactory);

    var _circuitGridFactory = circuitGridFactory();
    var _mazeGridFactory = mazeGridFactory(0.03);
    var _concentriGridFactory = concentricGridFactory();

    var levelStateFactories: { [_: string]: IStateFactory } = {};
    //levelStateFactories[level1] = _concentricLevelStateFactory(level2, 0, 4, 20, 70, 300, 5);
    levelStateFactories[level1] = _gridLevelStateFactory(level2, 0, 250, 32, 3, 2, 1, 20, 70, 15, 1, _concentriGridFactory);
    levelStateFactories[level2] = _gridLevelStateFactory(level3, 0, 300, 12, 2, 2, 1, 20, 85, 5, 1, looseEndsTrimmingGridFactoryProxy(mergingGridFactoryProxy([_mazeGridFactory], 3)));
    levelStateFactories[level3] = _gridLevelStateFactory(level4, 0, 400, 12, 3, 2, 1, 20, 80, 2, 0.5, mergingGridFactoryProxy([_circuitGridFactory], 6));
    levelStateFactories[level4] = _gridLevelStateFactory(level1, 1, 500, 24, 3, 2, 1, 20, 75, 3, 1, mergingGridFactoryProxy([_concentriGridFactory, _mazeGridFactory, _circuitGridFactory], 2));

    var menuState = new MenuState(menuStateElement, "l", levelStateFactories);
    

    var _delegatingLevelStateFactory = delegatingLevelStateFactory(
        levelStateFactories,
        menuState,
        level1,
        jumpSound,
        shootSound,
        playerDeathSound,
        winSound,
        wallJumpAvailableSound);

    var engine = new Engine(_delegatingLevelStateFactory);

    var locationToLevel = function () {
        var hash = location.hash;
        var param: any;
        if (hash) {
            // attempt to load a specific level
            hash = hash.substr(1);
            var levelStateFactoryParam = levelNameToLevelStatFactoryParam(hash);
            if (levelStateFactoryParam) {
                var data = findLevelStateData(levelStateFactoryParam.difficulty, levelStateFactoryParam.levelName);
                if (data) {
                    paramType = StateFactoryParamType.LevelLoad;
                    param = levelStateFactoryParam;
                } else {
                    param = null;
                }
            } else {
                param = null;
            }
        }
        return param;
    
    };

    var param = locationToLevel();
    var paramType: number;
    if (param == null) {
        paramType = StateFactoryParamType.LevelRestart;
    } else {
        var hash = location.hash;
        var oldURL = location.href;
        var newURL = location.href.substr(0, location.href.length - hash.length);
        // replace with menu/home screen (then we load a level, so it goes on top of this, so back always goes back!)
        history.replaceState(null, null, newURL);
        history.pushState(null, null, oldURL);
    }

    engine.setStateFromParam(paramType, param);

    w.onpopstate = (event: PopStateEvent) => {
        var state = event.state;
        if (state == null) {
            state = locationToLevel();
        }
        if (state) {
            // load it!
            engine.setStateFromParam(StateFactoryParamType.LevelLoad, state);
        } else {
            // restart!
            // TODO menu
            engine.setStateFromParam(StateFactoryParamType.LevelRestart, null);
        }
    }


};